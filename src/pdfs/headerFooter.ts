import PDFDocument from 'pdfkit';
import path from 'path';

export const addHeader = (doc: PDFKit.PDFDocument) => {
  // Logo (top-left)
  doc.image(
   path.join(__dirname, '../assets/profileImages/srytal-logo.jpeg'),
    50,
    30,
    { width: 120 }
  );

  // Confidential (top-right)
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Strictly Private & Confidential', 0, 35, {
      align: 'right',
    });

  doc
    .font('Helvetica')
    .text('[MONTH] [DAY], [YEAR]', {
      align: 'right',
    });

  doc.moveDown(4);
};


