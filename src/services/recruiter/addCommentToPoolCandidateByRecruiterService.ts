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
    }, { new: true });

    if (result && result.id) {
        result = await TalentPoolCandidatesModel
            .findOne({ _id: id })
            .populate('comments.userId', 'firstName lastName');
    }

    return result;
}

export default { addCommentToPoolCandidateByRecruiter }
