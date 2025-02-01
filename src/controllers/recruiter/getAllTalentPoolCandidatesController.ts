import { Request, Response } from 'express';
import { SUPERADMIN_ERROR } from '../../constants/superadmin/superadminErrorMessage';
import getAllTalentPoolCandidatesServices from '../../services/recruiter/getAllTalentPoolCandidatesByRecruiterService';

const getAllTalentPoolCandidatesByRecruiter = (req: Request, res: Response) => {
    getAllTalentPoolCandidatesServices
        .getAllTalentPoolCandidatesService()
        .then(getAllTalentPoolCandidatesResponse => {
            res.status(200).json(getAllTalentPoolCandidatesResponse);
        })
        .catch(error => {
            console.error(`Error in fetching all talent pool candidates details:${error} `);
            res.status(500).json({ success: false, message: SUPERADMIN_ERROR.FETCHING_ALL_EMPLOYEE_DETAILS_ERROR });
        });
};

export default { getAllTalentPoolCandidatesByRecruiter }