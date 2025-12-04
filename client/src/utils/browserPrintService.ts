/**
 * Browser Print Service
 * Auto-print receipts using browser's native print API
 * Works without QZ Tray - simpler solution!
 */

interface PrintData {
  orderId: string;
  orderNumber: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customPizza?: any;
  }>;
  subtotal: number;
  gst: number;
  pst: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdByName?: string;
  notes?: string;
  restaurantInfo?: {
    name: string;
    address: string;
    phone: string;
  };
}

class BrowserPrintService {
  /**
   * Format receipt as HTML for printing
   */
  formatReceiptHTML(data: PrintData): string {
    const {
      orderId,
      orderNumber,
      items,
      subtotal,
      gst,
      pst,
      tax,
      total,
      paymentMethod,
      createdByName,
      notes,
      restaurantInfo,
    } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Receipt #${orderNumber}</title>
        <style>
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 10mm;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12pt;
            width: 80mm;
            margin: 0 auto;
          }
          
          .receipt {
            text-align: center;
          }
          
          .header {
            border-top: 2px dashed #000;
            border-bottom: 2px dashed #000;
            padding: 5px 0;
            margin: 10px 0;
          }
          
          .shop-name {
            font-size: 18pt;
            font-weight: bold;
            margin: 5px 0;
          }
          
          .info {
            font-size: 10pt;
            margin: 2px 0;
          }
          
          .section {
            border-top: 1px dashed #000;
            padding: 5px 0;
            margin: 5px 0;
          }
          
          .items {
            text-align: left;
          }
          
          .item {
            margin: 5px 0;
          }
          
          .item-name {
            font-weight: bold;
          }
          
          .item-details {
            font-size: 10pt;
            margin-left: 10px;
            color: #333;
          }
          
          .totals {
            text-align: right;
            margin-top: 10px;
          }
          
          .total-line {
            margin: 3px 0;
          }
          
          .grand-total {
            font-size: 14pt;
            font-weight: bold;
            border-top: 2px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          
          .footer {
            text-align: center;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px dashed #000;
          }
        </style>
      </head>
      <body onload="window.print(); setTimeout(() => window.close(), 500);">
        <div class="receipt">
          <div class="header">
            <div class="shop-name">${restaurantInfo?.name || "PIZZA SHOP"}</div>
            ${
              restaurantInfo?.address
                ? `<div class="info">${restaurantInfo.address}</div>`
                : ""
            }
            ${
              restaurantInfo?.phone
                ? `<div class="info">Phone: ${restaurantInfo.phone}</div>`
                : ""
            }
          </div>
          
          <div class="section">
            <div class="info">Order #${
              orderNumber || orderId.slice(0, 8).toUpperCase()
            }</div>
            <div class="info">${new Date().toLocaleString()}</div>
            ${
              createdByName
                ? `<div class="info">Served by: ${createdByName}</div>`
                : ""
            }
          </div>
          
          <div class="section items">
            <strong>ITEMS</strong>
            ${items
              .map((item) => {
                const itemTotal = (item.price * item.quantity).toFixed(2);
                let html = `
                <div class="item">
                  <div class="item-name">
                    ${item.quantity}x ${item.name} - $${itemTotal}
                  </div>
              `;

                if (item.customPizza) {
                  html += `
                  <div class="item-details">
                    Size: ${item.customPizza.size}<br/>
                    Crust: ${item.customPizza.crust}
                `;
                  if (item.customPizza.toppings?.length > 0) {
                    html += `<br/>Toppings: ${item.customPizza.toppings.join(
                      ", "
                    )}`;
                  }
                  html += `</div>`;
                }

                html += `</div>`;
                return html;
              })
              .join("")}
          </div>
          
          <div class="totals">
            <div class="total-line">Subtotal: $${subtotal.toFixed(2)}</div>
            ${
              gst
                ? `<div class="total-line">GST (5%): $${gst.toFixed(2)}</div>`
                : ""
            }
            ${
              pst
                ? `<div class="total-line">PST (7%): $${pst.toFixed(2)}</div>`
                : ""
            }
            ${
              !gst && !pst && tax
                ? `<div class="total-line">Tax: $${tax.toFixed(2)}</div>`
                : ""
            }
            <div class="grand-total">TOTAL: $${total.toFixed(2)}</div>
            <div class="total-line">Payment: ${paymentMethod.toUpperCase()}</div>
          </div>
          
          ${
            notes
              ? `
            <div class="section">
              <strong>Note:</strong><br/>
              ${notes}
            </div>
          `
              : ""
          }
          
          <div class="footer">
            <div>Thank you for your order!</div>
            <div>Visit us again soon!</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Print receipt using browser print dialog
   */
  async print(data: PrintData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🖨️  Opening print dialog...");

      const receiptHTML = this.formatReceiptHTML(data);

      // Open print window
      const printWindow = window.open("", "_blank", "width=300,height=600");

      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      printWindow.document.write(receiptHTML);
      printWindow.document.close();

      console.log("✅ Print dialog opened");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Print error:", error);
      return { success: false, error: error.message };
    }
  }
}

export const browserPrintService = new BrowserPrintService();
