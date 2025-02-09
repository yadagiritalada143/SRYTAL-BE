import TalentPoolCandidatesModel from '../../model/talentPoolCandidatesModel';

interface FetchTalentPoolCandidatesListResponse {
    success: boolean;
    talentPoolCandidatesList?: any;
}

const getAllTalentPoolCandidatesService = (): Promise<FetchTalentPoolCandidatesListResponse> => {
    return new Promise((resolve, reject) => {
        TalentPoolCandidatesModel
            .find({})
            .populate('comments.userId', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .then((talentPoolCandidates: any) => {
                if (!talentPoolCandidates || talentPoolCandidates.length === 0) {
                    return reject({ success: false });
                }

                talentPoolCandidates = talentPoolCandidates.map((candidate: any) => {
                    if (Array.isArray(candidate.comments)) {
                        candidate.comments = candidate.comments
                            .map((comment: any) => ({
                                ...comment,
                                updateAt: new Date(comment.updateAt).getTime() || 0, // Ensure updateAt is a valid timestamp
                            }))
                            .sort((a: any, b: any) => b.updateAt - a.updateAt);
                    }
                    return candidate;
                });

                talentPoolCandidates.sort((a: any, b: any) => {
                    const latestCommentA = a.comments?.[0]?.updateAt || 0;
                    const latestCommentB = b.comments?.[0]?.updateAt || 0;

                    return latestCommentB - latestCommentA;
                });

                resolve({
                    success: true,
                    talentPoolCandidatesList: talentPoolCandidates,
                });
            })
            .catch((error: any) => {
                console.error('Error in fetching talent pool candidates details:', error);
                reject({ success: false });
            });
    });
};

export default { getAllTalentPoolCandidatesService }
