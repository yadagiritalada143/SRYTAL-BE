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
                    if (Array.isArray(talentPoolCandidateDetails.comments)) {
                        talentPoolCandidateDetails.comments = talentPoolCandidateDetails.comments
                            .map((comment: any) => ({
                                ...comment,
                                updateAt: new Date(comment.updateAt).getTime() || 0,
                            }))
                            .sort((a: any, b: any) => b.updateAt - a.updateAt);
                    }

                    resolve({
                        success: true,
                        talentPoolCandidateDetails,
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
