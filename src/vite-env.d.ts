/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_MAX_FREE_USERS: string;
  readonly VITE_FREE_USER_QUOTA_BYTES: string;
  readonly VITE_FREE_USER_ACTIVE_DAYS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
