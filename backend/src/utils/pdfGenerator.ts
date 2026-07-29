import PDFDocument from 'pdfkit';

interface ChallanPDFData {
  challanNo: string;
  customerName: string;
  customerCompany?: string | null;
  customerAddress: string;
  customerCity: string;
  status: string;
  createdAt: Date | string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string | null;
  items: Array<{
    skuSnapshot: string;
    nameSnapshot: string;
    priceSnapshot: number;
    quantity: number;
    lineTotal: number;
  }>;
}

export const generateChallanPDF = (data: ChallanPDFData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fillColor('#1E293B').fontSize(24).text('FLOWSPHERE ERP', 50, 45);
      doc.fontSize(10).fillColor('#64748B').text('Enterprise Operations & Distribution Portal', 50, 72);

      doc.fontSize(18).fillColor('#2563EB').text('SALES CHALLAN', 345, 45, { width: 200, align: 'right' });
      doc.fontSize(10).fillColor('#334155').text(`#${data.challanNo}`, 345, 68, { width: 200, align: 'right' });
      doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 345, 82, { width: 200, align: 'right' });
      doc.text(`Status: ${data.status}`, 345, 96, { width: 200, align: 'right' });

      doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#E2E8F0').stroke();

      // Customer Details
      doc.fontSize(12).fillColor('#0F172A').text('BILL TO:', 50, 130);
      doc.fontSize(11).fillColor('#334155').text(data.customerName, 50, 148);
      if (data.customerCompany) {
        doc.text(data.customerCompany, 50, 162);
      }
      doc.fontSize(10).fillColor('#64748B').text(`${data.customerAddress}, ${data.customerCity}`, 50, 176);

      // Line Items Table Header
      const tableTop = 220;
      doc.rect(50, tableTop, 495, 25).fill('#F1F5F9');
      doc.fillColor('#334155').fontSize(10).text('SKU', 60, tableTop + 7);
      doc.text('Item Description', 130, tableTop + 7);
      doc.text('Unit Price', 320, tableTop + 7, { width: 70, align: 'right' });
      doc.text('Qty', 400, tableTop + 7, { width: 50, align: 'center' });
      doc.text('Total', 460, tableTop + 7, { width: 75, align: 'right' });

      let currentY = tableTop + 30;

      data.items.forEach((item) => {
        const nameHeight = doc.heightOfString(item.nameSnapshot, { width: 180 });
        const rowHeight = Math.max(nameHeight, 15) + 10;
        
        if (currentY + rowHeight > 700) {
          doc.addPage();
          currentY = 50;
        }

        doc.fillColor('#0F172A').fontSize(9).text(item.skuSnapshot, 60, currentY);
        doc.text(item.nameSnapshot, 130, currentY, { width: 180 });
        doc.text(`Rs. ${item.priceSnapshot.toFixed(2)}`, 320, currentY, { width: 70, align: 'right' });
        doc.text(item.quantity.toString(), 400, currentY, { width: 50, align: 'center' });
        doc.text(`Rs. ${item.lineTotal.toFixed(2)}`, 460, currentY, { width: 75, align: 'right' });

        currentY += rowHeight;
      });

      doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#CBD5E1').stroke();
      currentY += 15;

      // Summary
      doc.fontSize(10).fillColor('#64748B').text('Subtotal:', 360, currentY, { width: 90, align: 'right' });
      doc.fillColor('#0F172A').text(`Rs. ${data.subtotal.toFixed(2)}`, 460, currentY, { width: 75, align: 'right' });
      currentY += 18;

      doc.fontSize(10).fillColor('#64748B').text('Tax (10%):', 360, currentY, { width: 90, align: 'right' });
      doc.fillColor('#0F172A').text(`Rs. ${data.tax.toFixed(2)}`, 460, currentY, { width: 75, align: 'right' });
      currentY += 20;

      doc.rect(350, currentY - 5, 195, 30).fill('#EFF6FF');
      doc.fontSize(12).fillColor('#1E40AF').text('Grand Total:', 360, currentY, { width: 90, align: 'right' });
      doc.fontSize(12).fillColor('#1E40AF').text(`Rs. ${data.total.toFixed(2)}`, 460, currentY, { width: 75, align: 'right' });

      if (data.notes) {
        doc.fontSize(10).fillColor('#475569').text('Notes / Instructions:', 50, currentY + 40);
        doc.fontSize(9).fillColor('#64748B').text(data.notes, 50, currentY + 55, { width: 280 });
      }

      // Footer
      doc.fontSize(8).fillColor('#94A3B8').text('FlowSphere ERP System - Generated Automatically', 50, 750, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
