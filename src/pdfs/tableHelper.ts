import PDFDocument from 'pdfkit';

interface SalaryRow {
  component: string;
  perAnnum: string;
  perMonth: string;
}

export const salaryTable = (
  doc: PDFKit.PDFDocument,
  startX: number,
  startY: number,
  rows: SalaryRow[]
) => {
  const rowHeight = 25;
  const colComponent = 230;
  const colPerAnnum = 130;
  const colPerMonth = 130;
  const tableWidth = colComponent + colPerAnnum + colPerMonth;

  const requiredHeight = rowHeight * (rows.length + 2);

  // Page break safety
  if (startY + requiredHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    startY = doc.y;
  }

  // Header row 1
  doc.rect(startX, startY, tableWidth, rowHeight).stroke();
  doc.rect(startX, startY, colComponent, rowHeight * 2).stroke();

  doc
    .font('Helvetica-Bold')
    .text('Components', startX + 5, startY + 15, {
      width: colComponent - 10,
      align: 'center',
    });

  doc
    .rect(
      startX + colComponent,
      startY,
      colPerAnnum + colPerMonth,
      rowHeight
    )
    .stroke();

  doc.text('Amount in RS', startX + colComponent, startY + 7, {
    width: colPerAnnum + colPerMonth,
    align: 'center',
  });

  // Header row 2
  const y2 = startY + rowHeight;

  doc.rect(startX + colComponent, y2, colPerAnnum, rowHeight).stroke();
  doc
    .rect(startX + colComponent + colPerAnnum, y2, colPerMonth, rowHeight)
    .stroke();

  doc.text('Per Annum', startX + colComponent, y2 + 7, {
    width: colPerAnnum,
    align: 'center',
  });

  doc.text('Per Month', startX + colComponent + colPerAnnum, y2 + 7, {
    width: colPerMonth,
    align: 'center',
  });

  // Data rows
  doc.font('Helvetica');

  rows.forEach((row, i) => {
    const y = startY + rowHeight * (i + 2);

    doc.rect(startX, y, colComponent, rowHeight).stroke();
    doc.text(row.component, startX + 5, y + 7, {
      width: colComponent - 10,
    });

    doc.rect(startX + colComponent, y, colPerAnnum, rowHeight).stroke();
    doc.text(row.perAnnum, startX + colComponent + 5, y + 7, {
      width: colPerAnnum - 10,
      align: 'center',
    });

    doc
      .rect(startX + colComponent + colPerAnnum, y, colPerMonth, rowHeight)
      .stroke();

    doc.text(
      row.perMonth,
      startX + colComponent + colPerAnnum + 5,
      y + 7,
      { width: colPerMonth - 10, align: 'center' }
    );
  });
};
