export {};

declare global {
  interface Window {
    socket: any;
    electron: {
      platform: string;
    };
  }
}
