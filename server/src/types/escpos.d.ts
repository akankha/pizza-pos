// Type declarations for escpos and escpos-usb libraries
// These packages don't have official TypeScript definitions

declare module 'escpos' {
  export class Printer {
    constructor(device: any);
    font(type: string): this;
    align(alignment: string): this;
    style(style: string): this;
    size(width: number, height: number): this;
    text(text: string): this;
    cut(): this;
    close(): void;
  }

  export default {
    Printer
  };
}

declare module 'escpos-usb' {
  export function findPrinter(): any[];
  export default {
    findPrinter
  };
}
