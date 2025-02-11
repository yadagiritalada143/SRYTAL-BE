import TalentPoolCandidatesModel from '../../model/talentPoolCandidatesModel';

const addCommentToPoolCandidateByRecruiter = async ({ id, comment, callStartsAt, callEndsAt, userId }: any) => {
    let result = await TalentPoolCandidatesModel.findByIdAndUpdate(id, {
        lastUpdatedAt: new Date(),
        $push: {
            comments: {
                comment,
                userId,
                callStartsAt,
                callEndsAt,
                updateAt: new Date()
            }
        }
    }, {
        new: true, populate: {
            path: 'comments.userId',
            select: 'firstName lastName'
        }
    });

    return result;
}

export default { addCommentToPoolCandidateByRecruiter }
