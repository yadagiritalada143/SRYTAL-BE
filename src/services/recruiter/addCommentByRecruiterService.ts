import PoolCompaniesModel from '../../model/poolCompanies';

const addCommentByRecruiter = async ({ id, comment, userId }: any) => {
    let result = await PoolCompaniesModel.findByIdAndUpdate(id, {
        lastUpdatedAt: new Date(),
        $push: {
            comments: {
                comment,
                userId,
                updateAt: new Date()
            }
        }
    }, { new: true });

    if (result && result.id) {
        result = await PoolCompaniesModel
            .findOne({ _id: id })
            .populate('comments.userId', 'firstName lastName');
    }

    return result;
}

export default { addCommentByRecruiter }