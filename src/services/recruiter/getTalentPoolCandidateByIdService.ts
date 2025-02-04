import TalentPoolCandidatesModel from '../../model/talentPoolCandidatesModel';

interface FetchTalentPoolCandidateDetailsResponse {
    success: boolean;
    talentPoolCandidateDetails?: any;
}

const getTalentPoolCandidateDetails = (talentPoolCandidateId: string): Promise<FetchTalentPoolCandidateDetailsResponse> => {
    return new Promise((resolve, reject) => {
        TalentPoolCandidatesModel
            .findById({ _id: talentPoolCandidateId })
            .populate('comments.userId', 'firstName lastName')
            .then((talentPoolCandidateDetails: any) => {
                if (!talentPoolCandidateDetails) {
                    reject({ success: false });

                } else {
                    resolve({
                        success: true,
                        talentPoolCandidateDetails: talentPoolCandidateDetails
                    });
                }
            })
            .catch((error: any) => {
                console.error('Error in fetching talent pool candidates details:', error);
                reject({ success: false });
            });
    });

};

export default { getTalentPoolCandidateDetails }
