/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  /** Soles charged per 100 pavos (default 1.30). */
  readonly VITE_SOLES_PER_100_PAVOS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}