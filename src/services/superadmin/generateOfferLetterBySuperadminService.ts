import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { addHeader, addFooter } from '../../pdfs/headerFooter';
import {  salaryTable } from '../../pdfs/tableHelper';


const generateOfferLetterBySuperadmin = async (
  res: Response,
  nameOfTheCandidate: string,
  subject: string,
  role: string,
  dateOfJoining: string,
  compensation: string,
  workLocation: string
) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${nameOfTheCandidate}_OfferLetter.pdf`
  );

  doc.pipe(res);

  addHeader(doc);

  const leftPadding = 30;
// -------------------------------------ADDRESS BLOCK--------------------------

  doc.fontSize(10).font('Helvetica-Bold').text('To,', leftPadding);
  doc.moveDown(0.5);

  doc.font('Helvetica').text(
    `Mr. ${nameOfTheCandidate}
S/O [FATHER NAME],
DR.NO: [DOOR NUMBER],
[FULL ADDRESS],
[PIN].`,
  );

  doc.moveDown();

  doc.font('Helvetica-Bold').text(`Dear ${nameOfTheCandidate},`);
  doc.moveDown();

  doc
    .font('Helvetica-Bold')
    .text(`Sub: Offer of appointment for the post of "${role}"`, {
      align: 'center',
    });

  doc.moveDown();

// ----------BODY---------------

  doc.font('Helvetica').text('Congratulations!!!');
  doc.moveDown();

  doc.text(
    `Subsequent to the discussion we had recently with you, we are pleased to offer you an appointment in SRYTAL Systems India Private Limited as per the terms and conditions mentioned below: `,
  );

  doc.moveDown();

  doc.font('Helvetica-Bold').text('1. DATE OF JOINING');
  doc.moveDown();
  doc.font('Helvetica').text(
    `Your employment will commence not later than ${dateOfJoining}.`
  );
  doc.moveDown();

  doc.font('Helvetica-Bold').text('2. DESIGNATION');
  doc.moveDown(1);
  doc.font('Helvetica').text(
    `${role}\nExample: Senior Software Engineer (D3); Level – A3`
  );
  doc.moveDown();

  doc.font('Helvetica-Bold').text('3. COMPENSATION');
  doc.moveDown();
  doc.font('Helvetica').text(
    `Your total salary per annum is INR ${compensation} only.
Details of your salary structure are given in the Annexure.`
  );
  doc.moveDown();

  doc.font('Helvetica-Bold').text('4. LEAVE');
  doc.moveDown();
  doc.font('Helvetica').text(
    `You will be entitled to 20 days leave in a calendar year on monthly accrual basis.
If your joining is between a calendar year, the said number of leaves shall be pro-rated.`
  );
  doc.moveDown();

  doc.font('Helvetica-Bold').text('5. PLACEMENT OF WORK');
  doc.moveDown();
  doc.font('Helvetica').text(
    `Your place of work will be at ${workLocation}.
You shall be liable to serve in any Position, Department or Shift as assigned.
The company may also transfer you to any of its establishments or associate companies.`
  );
  doc.moveDown();
  doc.font('Helvetica-Bold').text('2.PLACEMENT OF WORK  ');
  doc.font('Helvetica').text(
    `${role}\nYour place of work will be at Hyderabad.`
  );
  doc.moveDown();
  doc.font('Helvetica').text(`You shall be liable to serve in any Position, Department or Shift as you may be assigned from 
time to time.`);
doc.moveDown();
doc.font('Helvetica').text(`During your employment, you may be transferred to any of the establishments of the 
Company or associate Companies in which case you will be governed by the rules and 
regulations applicable to that establishment.  `);
  doc.font('Helvetica-Bold').text('2. DESIGNATION');
  doc.font('Helvetica').text(
    `${role}\nExample: Senior Software Engineer (D3); Level – A3`
  );
  doc.moveDown(2);



  const tableData = [
    { component: 'Basic Salary', perAnnum: '₹6,00,000', perMonth: '₹50,000', },
    { component: 'House Rent Allowance', perAnnum: '₹8,00,000', perMonth: '₹66,667', },

  ];

  const startX = doc.page.margins.left; 
  const startY = doc.y;
  salaryTable(doc, startX, startY, tableData);
  doc.moveDown();
  doc.end();
};

export default { generateOfferLetterBySuperadmin };
