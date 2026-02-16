import offerLetterTemplate from '../../util/pdfGenerator/templates/offerLetterTemplate';
import pdfGenerator from '../../util/pdfGenerator/generatePDF';

export interface IOfferLetterRequest {
  nameOfTheCandidate: string;
  subject: string;
  role: string;
  dateOfJoining: string;
  compensation: string;
  workLocation: string;
  offerDate: string;
}

export interface IPDFGenerationResult {
    success: boolean;
    pdfBuffer?: Buffer;
    fileName?: string;
    error?: string;
}

const OFFER_PDF_HEADER_TEMPLATE = `
<div style="width:100%; font-size:12px; text-align:center;">
  <strong>Company Name Pvt Ltd</strong>
</div>
`;

const getOfferPdfFooterTemplate = () => `
<div style="width:100%; font-size:10px; text-align:center;">
  Page <span class="pageNumber"></span> of <span class="totalPages"></span>
</div>
`;


const validateOfferLetterRequest = (request: IOfferLetterRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!request.nameOfTheCandidate) errors.push('Candidate name is required');
  if (!request.subject) errors.push('Subject is required');
  if (!request.role) errors.push('Role is required');
  if (!request.dateOfJoining) errors.push('Date of joining is required');
  if (!request.compensation) errors.push('Compensation is required');
  if (!request.workLocation) errors.push('Work location is required');
  if (!request.offerDate) errors.push('Offer date is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const generateOfferLetterByAdminService = async (request: IOfferLetterRequest): Promise<IPDFGenerationResult & { fileName?: string }> => {
  try {
    const validation = validateOfferLetterRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    const offerLetterData = request;

    const htmlContent = pdfGenerator.injectDataIntoTemplate(
      offerLetterTemplate,
      offerLetterData as unknown as Record<string, any>
    );

    const pdfResult = await pdfGenerator.generatePDFWithHeaderFooter(
      htmlContent,
      OFFER_PDF_HEADER_TEMPLATE,
      getOfferPdfFooterTemplate(),
      {
        format: 'A4',
        margin: {
          top: '60px',
          right: '20px',
          bottom: '80px',
          left: '20px',
        },
        printBackground: true,
      }
    );

    if (pdfResult.success) {
      const fileName = `Offer-Letter-${request.nameOfTheCandidate.replace(
        /\s+/g,
        '-'
      )}.pdf`;

      return {
        ...pdfResult,
        fileName,
      };
    }

    return pdfResult;
  } catch (error: any) {
    console.error(`Error generating offer letter: ${error}`);
    return {
      success: false,
      error: error.message || 'Failed to generate offer letter',
    };
  }
};

export default { validateOfferLetterRequest, generateOfferLetterByAdminService };
