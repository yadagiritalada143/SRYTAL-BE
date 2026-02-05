export const addFooter = (doc: PDFKit.PDFDocument) => {
  const pageWidth = doc.page.width;
  const margin = doc.page.margins.left;

  // Lock footer to bottom
  const footerTop = doc.page.height - 80;

  /* =====================
     TOP HORIZONTAL LINE
  ===================== */
  doc
    .strokeColor('#555555')
    .lineWidth(1.3)
    .moveTo(margin, footerTop)
    .lineTo(pageWidth - margin, footerTop)
    .stroke();

  /* =====================
     LEFT BLOCK
  ===================== */
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#1aa3c7')
    .text(
      'SRYTAL Systems India Private Limited',
      margin,
      footerTop + 10,
      { lineBreak: false }
    );

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#000000')
    .text(
      'Hyderabad, Telangana - 500032, INDIA.',
      margin,
      footerTop + 24,
      { lineBreak: false }
    );

  doc.text(
    'GSTIN: 36ABOCS4994F1Z0',
    margin,
    footerTop + 36,
    { lineBreak: false }
  );

  doc.text(
    'CIN: U62013TS2024PTC190245',
    margin,
    footerTop + 48,
    { lineBreak: false }
  );

  /* =====================
     RIGHT BLOCK
  ===================== */
  const rightX = pageWidth - margin - 100;
  const emailY = footerTop + 10;

doc
  .font('Helvetica')
  .fontSize(8)
  .fillColor('#000000')
  .text(
    'E-mail:',
    rightX,
    emailY,
    {
      width: 200,
    //   align: 'right',
      continued: true,
    }
  );

doc
  .fillColor('#1aa3c7')
  .font('Helvetica')
  .text(
    'admin@srytal.com',
    {
      link: 'mailto: admin@srytal.com',
      underline: true,
    }
  );


  doc
    .fillColor('#1aa3c7')
    .text(
      'www.srytal.com',
      rightX,
      footerTop + 20,
      {
        link: 'https://www.srytal.com',
        width: 60,
        align: 'right',
      }
    );

  // Reset color
  doc.fillColor('#000000');
};
