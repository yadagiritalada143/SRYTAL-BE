import UserModel from '../../model/userModel';

const updateAppWalkThrough = async (applicationWalkThroughToUpdate: any) => {
    try {
        const result = await UserModel.updateOne({ _id: applicationWalkThroughToUpdate.user_id }, { applicationWalkThrough: Number(applicationWalkThroughToUpdate.applicationWalkThrough) });
        return result;
    } catch (error: any) {
        console.error(`Error occured while updating applicationwalk through: ${error}`);
        return error;
    }
}

export default { updateAppWalkThrough };
