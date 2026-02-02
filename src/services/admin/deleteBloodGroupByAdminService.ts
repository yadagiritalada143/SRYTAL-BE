import BloodgroupModel from '../../model/bloodGroupModel'

interface deleteBloodGroupResponse {
    success: boolean;
    responseAfterDelete?: any;
}

const deleteBloodGroupByAdmin = async (id: any): Promise<deleteBloodGroupResponse> => {
    try {
        const result = await BloodgroupModel.findByIdAndDelete({ _id: id });
        if (result) {
            return { success: true, responseAfterDelete: result };
        } else {
            return { success: false };
        }
    } catch (error: any) {
        console.error(`Error in  deleting blood group: ${error}`);
        return { success: false, responseAfterDelete: error }
    }
}

export default { deleteBloodGroupByAdmin };
