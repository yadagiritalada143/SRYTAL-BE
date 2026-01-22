import UserModel from "../../model/userModel";

const updateProfileImageDetails = async (fileNameToUpload: string, userIdToUpdate: string) => {
    try {
        const user = await UserModel.findByIdAndUpdate(userIdToUpdate, {
            profileImage: fileNameToUpload,
        }, { new: true });

        return { success: true };
    } catch (error) {
        console.error(`Error while updating the profile image: ${error}`);
        return { success: false, error: error };
    }
}

export default { updateProfileImageDetails };
