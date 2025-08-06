/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_API_KEY: string;
  // add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}