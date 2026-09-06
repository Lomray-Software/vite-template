// The CLI generates this JSON after the client build, before the extra Worker entry.
declare module '*build/client/assets-manifest.json' {
  const manifest: import('@lomray/vite-ssr-boost/cloudflare').TRouteAssetsManifest;
  export default manifest;
}
