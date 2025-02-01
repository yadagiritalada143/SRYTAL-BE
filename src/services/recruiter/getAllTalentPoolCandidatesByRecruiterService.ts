import TalentPoolCandidatesModel from '../../model/talentPoolCandidatesModel';

interface FetchTalentPoolCandidatesListResponse {
    success: boolean;
    talentPoolCandidatesList?: any;
}

const getAllTalentPoolCandidatesService = (): Promise<FetchTalentPoolCandidatesListResponse> => {
    return new Promise((resolve, reject) => {
        TalentPoolCandidatesModel.find({})
            .then((talentPoolCandidates: any) => {
                if (!talentPoolCandidates) {
                    reject({ success: false });

                } else {
                    resolve({
                        success: true,
                        talentPoolCandidatesList: talentPoolCandidates
                    });
                }
            })
            .catch((error: any) => {
                console.error('Error in fetching talent pool candidates details:', error);
                reject({ success: false });
            });
    });

};

export default { getAllTalentPoolCandidatesService }
