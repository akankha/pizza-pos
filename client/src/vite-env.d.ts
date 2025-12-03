/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};

declare global {
  interface Window {
    socket: any;
    electron?: {
      platform: string;
      printer?: {
        print: (
          orderData: any
        ) => Promise<{ success: boolean; error?: string }>;
        checkStatus: () => Promise<{
          success: boolean;
          connected?: boolean;
          error?: string;
        }>;
      };
    };
  }
}
