import TalentPoolCandidatesModel from '../../model/talentPoolCandidatesModel';

const addTalentPoolCandidatesByRecruiter = async (detailsOfPoolCandidateToTracker: any) => {
    try {
        const talentPoolCandidateDataToSave: any = new TalentPoolCandidatesModel({ ...detailsOfPoolCandidateToTracker });
        const result = await talentPoolCandidateDataToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding candidates to talent pool tracker details:', error);
        return { success: false };
    }
}

export default { addTalentPoolCandidatesByRecruiter }
