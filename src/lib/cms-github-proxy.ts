import { createHash } from "crypto";
import { Octokit } from "@octokit/rest";

type CmsAction = {
  action: string;
  params?: Record<string, unknown>;
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

type FileRef = { path: string; label?: string };

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
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

function normalizeDataFile(item: unknown): DataFile | null {
  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;
  const nestedFile = record.file as { path?: string } | undefined;

  const path =
    typeof record.path === "string"
      ? record.path
      : typeof nestedFile?.path === "string"
        ? nestedFile.path
        : typeof record.file === "string"
          ? record.file
          : "";

  let raw = record.raw ?? record.data ?? record.content ?? record.string;
  if (raw !== null && typeof raw === "object") {
    raw = JSON.stringify(raw, null, 2);
  }

  if (typeof raw !== "string" || !path) {
    return null;
  }

  const slug =
    typeof record.slug === "string"
      ? record.slug
      : path.split("/").pop() ?? path;

  return {
    path: normalizePath(path),
    raw,
    slug,
    newPath:
      typeof record.newPath === "string"
        ? normalizePath(record.newPath)
        : undefined,
  };
}

function extractDataFiles(params: Record<string, unknown>): DataFile[] {
  const candidates: unknown[] = [];

  if (Array.isArray(params.dataFiles)) {
    candidates.push(...params.dataFiles.filter(Boolean));
  } else if (params.dataFiles) {
    candidates.push(params.dataFiles);
  } else if (params.entry) {
    candidates.push(params.entry);
  }

  return candidates
    .map((item) => normalizeDataFile(item))
    .filter((file): file is DataFile => file !== null);
}

function extractFileRefs(params: Record<string, unknown>): FileRef[] {
  if (!Array.isArray(params.files)) return [];

  return params.files
    .filter(
      (file): file is FileRef =>
        Boolean(
          file &&
            typeof file === "object" &&
            typeof (file as FileRef).path === "string"
        )
    )
    .map((file) => ({
      path: normalizePath(file.path),
      label: file.label ?? file.path,
    }));
}

function extractAssets(params: Record<string, unknown>): Asset[] {
  if (!Array.isArray(params.assets)) return [];

  return params.assets
    .filter(
      (asset): asset is Asset =>
        Boolean(
          asset &&
            typeof asset === "object" &&
            typeof (asset as Asset).path === "string" &&
            typeof (asset as Asset).content === "string"
        )
    )
    .map((asset) => ({
      path: normalizePath(asset.path),
      content: asset.content,
      encoding: "base64",
    }));
}

async function readRepoFile(octokit: Octokit, path: string) {
  const { owner, repo, branch } = getRepoConfig();
  const normalized = normalizePath(path);

  if (!normalized) return null;

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

    const results = await Promise.all(
      data
        .filter((item) => item.type === "file" && typeof item.path === "string")
        .map(async (item) => {
          const file = await readRepoFile(octokit, item.path);
          if (!file) return null;

          return {
            id: file.file.id,
            name: item.name,
            path: normalizePath(item.path),
            content: Buffer.from(file.data, "utf8").toString("base64"),
            encoding: "base64" as const,
          };
        })
    );

    return results.filter(Boolean);
  } catch {
    return [];
  }
}

export async function handleCmsProxyAction(body: CmsAction) {
  const params = body.params ?? {};
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
      const files = extractFileRefs(params);
      if (files.length === 0) {
        throw new Error("entriesByFiles requires at least one file path");
      }
      const entries = await Promise.all(
        files.map(async (file) => {
          const entry = await readRepoFile(octokit, file.path);
          if (!entry) {
            return {
              data: "",
              file: {
                path: file.path,
                label: file.label,
                id: null,
              },
            };
          }

          return {
            data: entry.data,
            file: {
              path: entry.file.path,
              label: file.label,
              id: entry.file.id,
            },
          };
        })
      );
      return entries;
    }

    case "getEntry": {
      const path = normalizePath(String(params.path ?? ""));
      if (!path) {
        throw new Error("getEntry requires a file path");
      }

      const entry = await readRepoFile(octokit, path);
      if (!entry) {
        throw new Error(`File not found: ${path}`);
      }

      return {
        data: entry.data,
        file: entry.file,
      };
    }

    case "persistEntry": {
      const dataFiles = extractDataFiles(params);

      if (dataFiles.length === 0) {
        const preview = JSON.stringify({
          dataFiles: params.dataFiles,
          entry: params.entry,
        }).slice(0, 800);
        console.error("persistEntry: invalid payload", preview);
        throw new Error(
          "No valid files to persist. Each file needs a path and content."
        );
      }

      const assets = extractAssets(params);
      const options = (params.options ?? {}) as { commitMessage?: string };
      const message =
        options.commitMessage ??
        `CMS: Update ${dataFiles.map((file) => file.path).join(", ")}`;

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
          path: asset.path,
          message,
          content: asset.content,
          branch,
          ...(existing?.sha ? { sha: existing.sha } : {}),
        });
      }

      return { message: "entry persisted" };
    }

    case "getMedia":
      return listMediaFiles(
        octokit,
        String(params.mediaFolder ?? "public/uploads")
      );

    case "getMediaFile": {
      const path = normalizePath(String(params.path ?? ""));
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
      const assetParam = params.asset;
      if (
        !assetParam ||
        typeof assetParam !== "object" ||
        typeof (assetParam as Asset).path !== "string" ||
        typeof (assetParam as Asset).content !== "string"
      ) {
        throw new Error("persistMedia requires a valid asset");
      }

      const asset: Asset = {
        path: normalizePath((assetParam as Asset).path),
        content: (assetParam as Asset).content,
        encoding: "base64",
      };

      const options = (params.options ?? {}) as { commitMessage?: string };
      const message = options.commitMessage ?? `CMS: Upload ${asset.path}`;
      const existing = await readRepoFile(octokit, asset.path);

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: asset.path,
        message,
        content: asset.content,
        branch,
        ...(existing?.sha ? { sha: existing.sha } : {}),
      });

      return {
        id: fileId(asset.content),
        content: asset.content,
        encoding: "base64",
        path: asset.path,
        name: asset.path.split("/").pop(),
      };
    }

    case "deleteFile": {
      const path = normalizePath(String(params.path ?? ""));
      const options = (params.options ?? {}) as { commitMessage?: string };
      await deleteRepoFile(
        octokit,
        path,
        options.commitMessage ?? `CMS: Delete ${path}`
      );
      return { message: `deleted file ${path}` };
    }

    case "deleteFiles": {
      const paths = Array.isArray(params.paths)
        ? params.paths.filter((path): path is string => typeof path === "string")
        : [];
      const options = (params.options ?? {}) as { commitMessage?: string };
      const message = options.commitMessage ?? "CMS: Delete files";
      await Promise.all(paths.map((path) => deleteRepoFile(octokit, path, message)));
      return { message: `deleted files ${paths.join(", ")}` };
    }

    case "getDeployPreview":
      return null;

    default:
      throw new Error(`Unsupported CMS action: ${body.action}`);
  }
}
