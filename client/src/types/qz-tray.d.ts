declare module "qz-tray" {
  export interface QZWebSocket {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isActive(): boolean;
  }

  export interface QZPrinters {
    find(): Promise<string[]>;
    getDefault(): Promise<string>;
  }

  export interface QZConfig {
    create(printer: string, options?: any): any;
  }

  export interface QZ {
    websocket: QZWebSocket;
    printers: QZPrinters;
    configs: QZConfig;
    print(config: any, data: any): Promise<void>;
  }

  const qz: QZ;
  export default qz;
}
