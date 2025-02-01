import UserModel from '../../model/userModel';

interface deleteBloodGroupResponse {
    success: boolean;
}

const deleteBloodGroupByAdmin = async (userIdToDelete: string): Promise<deleteBloodGroupResponse> => {
    return new Promise(async (resolve, reject) => {
        const result = await UserModel.updateOne(
            { _id: userIdToDelete },
            { isDeleted: true })
            .then((BloodGroupDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error('Error in deleting Blood Group:', error);
                reject({ success: false });
            });
    });
}

export default { deleteBloodGroupByAdmin  };


// import UserModel from '../../model/userModel';

// interface DeleteBloodGroupResponse {
//     success: boolean;
//     message: string;
// }

// const deleteBloodGroupByAdmin = async (userIdToDelete: string): Promise<DeleteBloodGroupResponse> => {
//     try {
//         const user = await UserModel.findById(userIdToDelete);
//         if (!user) {
//             return { success: false, message: "User not found." };
//         }

//         const updateResult = await UserModel.updateOne(
//             { _id: userIdToDelete },
//             { isDeleted: true }
//         );

//         if (updateResult.modifiedCount === 0) {
//             return { success: false, message: "Failed to delete blood group." };
//         }

//         return { success: true, message: "Blood group deleted successfully." };
//     } catch (error) {
//         console.error('Error in deleting Blood Group:', error);
//         return { success: false, message: "An error occurred while deleting the blood group." };
//     }
// };

// export default { deleteBloodGroupByAdmin };
