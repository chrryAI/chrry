/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_TESTING_ENV?: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
