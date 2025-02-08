import TalentPoolCandidatesModel from '../../model/talentPoolCandidatesModel';

const updatePoolCandidateDetails = async (detailsToUpdate: any) => {
    try {
        detailsToUpdate.lastUpdatedAt = new Date();
        const result = await TalentPoolCandidatesModel.updateOne({ _id: detailsToUpdate.id }, detailsToUpdate);
        return { success: result.acknowledged };
    } catch (error: any) {
        console.log('Error occured while updating the pool candidate details:', error);
        return { success: false };
    }
}

export default { updatePoolCandidateDetails }
