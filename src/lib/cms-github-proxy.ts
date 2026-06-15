import { createHash } from "crypto";
import { Octokit } from "@octokit/rest";

type CmsAction = {
  action: string;
  params: Record<string, unknown>;
};

type DataFile = {
  path: string;
  raw: string;
  slug?: string;
  newPath?: string;
};

type Asset = {
  path: string;
  content: string;
  encoding: "base64";
};

function getRepoConfig() {
  const repo = process.env.GITHUB_REPO ?? "yusifu-m-barrie/Abjatalstar";
  const token = process.env.GITHUB_TOKEN;
  const branch = process.env.GITHUB_BRANCH ?? "main";

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new Error("GITHUB_REPO must be in owner/repo format");
  }

  return { owner, repo: name, branch, token };
}

function fileId(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function normalizePath(path: string) {
  return path.replace(/\\/g, "/");
}

async function readRepoFile(octokit: Octokit, path: string) {
  const { owner, repo, branch } = getRepoConfig();
  const normalized = normalizePath(path);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: normalized,
      ref: branch,
    });

    if (Array.isArray(data) || data.type !== "file" || !("content" in data)) {
      return null;
    }

    const raw = Buffer.from(data.content, "base64").toString("utf8");
    return {
      data: raw,
      file: {
        path: normalized,
        id: fileId(raw),
        label: normalized,
      },
      sha: data.sha,
    };
  } catch {
    return null;
  }
}

async function writeRepoFile(
  octokit: Octokit,
  path: string,
  raw: string,
  message: string
) {
  const { owner, repo, branch } = getRepoConfig();
  const normalized = normalizePath(path);
  const existing = await readRepoFile(octokit, normalized);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: normalized,
    message,
    content: Buffer.from(raw, "utf8").toString("base64"),
    branch,
    ...(existing?.sha ? { sha: existing.sha } : {}),
  });
}

async function deleteRepoFile(
  octokit: Octokit,
  path: string,
  message: string
) {
  const { owner, repo, branch } = getRepoConfig();
  const normalized = normalizePath(path);
  const existing = await readRepoFile(octokit, normalized);
  if (!existing?.sha) return;

  await octokit.repos.deleteFile({
    owner,
    repo,
    path: normalized,
    message,
    sha: existing.sha,
    branch,
  });
}

async function listMediaFiles(octokit: Octokit, mediaFolder: string) {
  const { owner, repo, branch } = getRepoConfig();
  const folder = normalizePath(mediaFolder);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: folder,
      ref: branch,
    });

    if (!Array.isArray(data)) return [];

    return Promise.all(
      data
        .filter((item) => item.type === "file")
        .map(async (item) => {
          const file = await readRepoFile(octokit, item.path);
          if (!file) return null;
          const content = Buffer.from(file.data, "utf8").toString("base64");
          return {
            id: file.file.id,
            name: item.name,
            path: normalizePath(item.path),
            content,
            encoding: "base64" as const,
          };
        })
    ).then((items) => items.filter(Boolean));
  } catch {
    return [];
  }
}

export async function handleCmsProxyAction(body: CmsAction) {
  const octokit = new Octokit({ auth: getRepoConfig().token });
  const { owner, repo, branch } = getRepoConfig();

  switch (body.action) {
    case "info":
      return {
        repo,
        publish_modes: ["simple"],
        type: "local_fs",
      };

    case "entriesByFiles": {
      const files = (body.params.files ?? []) as Array<{ path: string; label?: string }>;
      const entries = await Promise.all(
        files.map(async (file) => {
          const entry = await readRepoFile(octokit, file.path);
          if (!entry) {
            return {
              data: null,
              file: {
                path: normalizePath(file.path),
                label: file.label ?? file.path,
                id: null,
              },
            };
          }
          return {
            data: entry.data,
            file: {
              path: entry.file.path,
              label: file.label ?? file.path,
              id: entry.file.id,
            },
          };
        })
      );
      return entries;
    }

    case "getEntry": {
      const path = String(body.params.path ?? "");
      const entry = await readRepoFile(octokit, path);
      if (!entry) {
        throw new Error(`File not found: ${path}`);
      }
      return entry;
    }

    case "persistEntry": {
      const params = body.params;
      const dataFiles: DataFile[] = Array.isArray(params.dataFiles)
        ? (params.dataFiles as DataFile[]).filter(
            (file): file is DataFile =>
              Boolean(file && typeof file.path === "string" && typeof file.raw === "string")
          )
        : params.entry &&
            typeof (params.entry as DataFile).path === "string" &&
            typeof (params.entry as DataFile).raw === "string"
          ? [params.entry as DataFile]
          : [];

      if (dataFiles.length === 0) {
        throw new Error("No valid files to persist");
      }

      const assets = ((params.assets ?? []) as Asset[]).filter(
        (asset): asset is Asset =>
          Boolean(asset && typeof asset.path === "string" && asset.content)
      );
      const options = (params.options ?? {}) as { commitMessage?: string };
      const message =
        options.commitMessage ??
        `CMS: Update ${dataFiles.map((f) => f.path).join(", ")}`;

      for (const file of dataFiles) {
        await writeRepoFile(octokit, file.path, file.raw, message);
        if (file.newPath && file.newPath !== file.path) {
          await writeRepoFile(octokit, file.newPath, file.raw, message);
          await deleteRepoFile(octokit, file.path, message);
        }
      }

      for (const asset of assets) {
        const existing = await readRepoFile(octokit, asset.path);
        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: normalizePath(asset.path),
          message,
          content: asset.content,
          branch,
          ...(existing?.sha ? { sha: existing.sha } : {}),
        });
      }

      return { message: "entry persisted" };
    }

    case "getMedia":
      return listMediaFiles(octokit, String(body.params.mediaFolder ?? "public/uploads"));

    case "getMediaFile": {
      const path = String(body.params.path ?? "");
      const file = await readRepoFile(octokit, path);
      if (!file) throw new Error(`Media not found: ${path}`);
      return {
        id: file.file.id,
        content: Buffer.from(file.data, "utf8").toString("base64"),
        encoding: "base64",
        path: file.file.path,
        name: file.file.path.split("/").pop(),
      };
    }

    case "persistMedia": {
      const asset = body.params.asset as Asset;
      const options = (body.params.options ?? {}) as { commitMessage?: string };
      const message = options.commitMessage ?? `CMS: Upload ${asset.path}`;
      const existing = await readRepoFile(octokit, asset.path);

      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: normalizePath(asset.path),
        message,
        content: asset.content,
        branch,
        ...(existing?.sha ? { sha: existing.sha } : {}),
      });

      const content = asset.content;
      return {
        id: fileId(Buffer.from(content, "base64").toString("binary")),
        content,
        encoding: "base64",
        path: normalizePath(asset.path),
        name: asset.path.split("/").pop(),
        sha: data.content?.sha,
      };
    }

    case "deleteFile": {
      const path = String(body.params.path ?? "");
      const options = (body.params.options ?? {}) as { commitMessage?: string };
      await deleteRepoFile(
        octokit,
        path,
        options.commitMessage ?? `CMS: Delete ${path}`
      );
      return { message: `deleted file ${path}` };
    }

    case "deleteFiles": {
      const paths = (body.params.paths ?? []) as string[];
      const options = (body.params.options ?? {}) as { commitMessage?: string };
      const message = options.commitMessage ?? `CMS: Delete files`;
      await Promise.all(paths.map((path) => deleteRepoFile(octokit, path, message)));
      return { message: `deleted files ${paths.join(", ")}` };
    }

    case "getDeployPreview":
      return null;

    default:
      throw new Error(`Unsupported CMS action: ${body.action}`);
  }
}
