import UserModel from '../../model/userModel';

const getProfileImage = async (userId: string) => {
    try {
        const profileDetails = await UserModel.findById({ _id: userId });
        const profileOriginaImagePath = profileDetails?.profileImage || '';
        return { success: true, imagePath: profileOriginaImagePath };
    } catch (error: any) {
        console.error(`Error while fetching the profile image: ${error}`);
        return { success: false, error: error };
    }
}

export default { getProfileImage }
