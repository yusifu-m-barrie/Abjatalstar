/**
 * Decap CMS backend for /admin after our own login gate.
 * Same API as the proxy server, but skips Decap's extra login screen.
 */

type CmsGlobal = {
  registerBackend: (
    name: string,
    backend: {
      init: (
        config: Record<string, unknown>,
        options?: Record<string, unknown>
      ) => SecuredProxyImplementation;
    }
  ) => void;
};

type AssetProxy = {
  path: string;
  toBase64?: () => Promise<string>;
};

type Entry = {
  dataFiles: Array<{ path: string; raw: string; slug?: string; newPath?: string }>;
  assets: AssetProxy[];
};

type PersistOptions = {
  commitMessage: string;
  useWorkflow?: boolean;
  status?: string;
  collectionName?: string;
};

type SecuredProxyImplementation = {
  isGitBackend: () => boolean;
  authComponent: () => () => null;
  authenticate: () => Promise<{ login: string; name: string }>;
  restoreUser: () => Promise<{ login: string; name: string }>;
  logout: () => null;
  status: () => Promise<{
    auth: { status: boolean };
    api: { status: boolean; statusPage: string };
  }>;
  getToken: () => Promise<string>;
  entriesByFolder: (
    folder: string,
    extension: string,
    depth: number
  ) => Promise<unknown>;
  entriesByFiles: (
    files: Array<{ path: string; label?: string }>
  ) => Promise<unknown>;
  getEntry: (path: string) => Promise<unknown>;
  persistEntry: (entry: Entry, options: PersistOptions) => Promise<unknown>;
  getMedia: (mediaFolder?: string) => Promise<unknown>;
  getMediaFile: (path: string) => Promise<unknown>;
  persistMedia: (
    asset: AssetProxy,
    options: PersistOptions
  ) => Promise<unknown>;
  deleteFiles: (paths: string[], commitMessage: string) => Promise<unknown>;
  getDeployPreview: (collection: string, slug: string) => Promise<unknown>;
};

function getBackendConfig(config: Record<string, unknown>) {
  const backend = config.backend as
    | { proxy_url?: string; branch?: string }
    | undefined;

  const proxyUrl = backend?.proxy_url?.trim();
  if (!proxyUrl) {
    throw new Error('CMS backend requires "proxy_url" in config.');
  }

  return {
    proxyUrl,
    branch: backend?.branch || "main",
    mediaFolder: (config.media_folder as string | undefined) ?? "public/uploads",
  };
}

export function registerSecuredProxyBackend(CMS: CmsGlobal) {
  const adminUser = { login: "admin", name: "Admin" };

  CMS.registerBackend("proxy", {
    init(config) {
      const { proxyUrl, branch, mediaFolder } = getBackendConfig(config);

      async function request(payload: {
        action: string;
        params: Record<string, unknown>;
      }) {
        const response = await fetch(proxyUrl, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ branch, ...payload }),
        });

        const json = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(json.error ?? `CMS request failed (${response.status})`);
        }

        return json;
      }

      async function serializeAsset(asset: AssetProxy) {
        if (!asset.toBase64) {
          throw new Error(`Missing media data for ${asset.path}`);
        }

        return {
          path: asset.path,
          content: await asset.toBase64(),
          encoding: "base64",
        };
      }

      return {
        isGitBackend: () => false,
        authComponent: () => () => null,
        authenticate: () => Promise.resolve(adminUser),
        restoreUser: () => Promise.resolve(adminUser),
        logout: () => null,
        status: () =>
          Promise.resolve({
            auth: { status: true },
            api: { status: true, statusPage: "" },
          }),
        getToken: () => Promise.resolve(""),

        entriesByFolder: (folder, extension, depth) =>
          request({
            action: "entriesByFolder",
            params: { branch, folder, extension, depth },
          }),

        entriesByFiles: (files) =>
          request({
            action: "entriesByFiles",
            params: { branch, files },
          }),

        getEntry: (path) =>
          request({
            action: "getEntry",
            params: { branch, path },
          }),

        persistEntry: async (entry, options) => {
          const assets = await Promise.all(entry.assets.map(serializeAsset));
          return request({
            action: "persistEntry",
            params: {
              branch,
              dataFiles: entry.dataFiles,
              assets,
              options,
            },
          });
        },

        getMedia: (folder = mediaFolder) =>
          request({
            action: "getMedia",
            params: { branch, mediaFolder: folder },
          }),

        getMediaFile: (path) =>
          request({
            action: "getMediaFile",
            params: { branch, path },
          }),

        persistMedia: async (asset, options) => {
          const serialized = await serializeAsset(asset);
          return request({
            action: "persistMedia",
            params: {
              branch,
              asset: serialized,
              options: { commitMessage: options.commitMessage },
            },
          });
        },

        deleteFiles: (paths, commitMessage) =>
          request({
            action: "deleteFiles",
            params: { branch, paths, options: { commitMessage } },
          }),

        getDeployPreview: () => Promise.resolve(null),
      } satisfies SecuredProxyImplementation;
    },
  });
}
