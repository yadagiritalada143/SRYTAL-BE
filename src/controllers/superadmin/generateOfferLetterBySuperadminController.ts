import { Request, Response } from 'express';
import generateOfferLetterBySuperadminService from '../../services/superadmin/generateOfferLetterBySuperadminService';

const generateOfferLetterBySuperadmin = async (req: Request, res: Response) => {
  try {
    const { nameOfTheCandidate, subject, role, dateOfJoining, compensation, workLocation } = req.body;

    if (!nameOfTheCandidate || !subject || !role || !dateOfJoining || !compensation || !workLocation) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    await generateOfferLetterBySuperadminService.generateOfferLetterBySuperadmin(
      res,
      nameOfTheCandidate,
      subject,
      role,
      dateOfJoining,
      compensation,
      workLocation
    );
  } catch (error) {
    console.error(`Error generating offer letter: ${error}`);
    res.status(500).json({ message: 'Error generating offer letter by superadmin.' });
  }
};

export default { generateOfferLetterBySuperadmin };
