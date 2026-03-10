/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL of the Node.js translation API gateway, e.g. http://localhost:3000 */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
