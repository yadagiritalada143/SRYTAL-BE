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

export const addFooter = (doc: PDFKit.PDFDocument) => {
  const pageWidth = doc.page.width;
  const margin = 50;
  const footerTop = doc.page.height - 90;

  // Horizontal line
  doc
    .moveTo(margin, footerTop)
    .lineTo(pageWidth - margin, footerTop)
    .lineWidth(1)
    .strokeColor('#444444')
    .stroke();

  // Left section
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#1aa3c7')
    .text('SRYTAL Systems India Private Limited', margin, footerTop + 10, { width: 250 });

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('black')
    .text(
      `Hyderabad, Telangana - 500032, INDIA.\nGSTIN: 36ABOCS4994F1Z0\nCIN: U62013TS2024PTC190245`,
      margin,
      footerTop + 25,
      { width: 250 }
    );

  // Right section
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#1aa3c7')
    .text(
      'Contact Info',
      pageWidth - margin - 100,
      footerTop + 10,
      {
        width: 200,
        align: 'right',
      }
    );

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('black')
    .text(
      'E-mail: admin@srytal.com\nwww.srytal.com',
      pageWidth - margin - 200,
      footerTop + 25,
      {
        width: 200,
        align: 'right',
      }
    );

  doc.fillColor('black');
};

