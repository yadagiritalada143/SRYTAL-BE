import BloodgroupModel from '../../model/bloodGroupModel';
import { IUpdateBloodGroupResponse } from '../../interfaces/bloodgroup';

const updateBloodGroupByAdmin = async (id: string, type: string): Promise<IUpdateBloodGroupResponse> => {
    try {
        const result = await BloodgroupModel.updateOne({ _id: id }, { type });
        if (result) {
            return { success: true, responseAfterupdate: result };
        } else {
            return { success: false };
        }
    } catch (error: any) {
        console.error(`Error in  updating blood group: ${error}`);
        return { success: false, responseAfterupdate: error }
    }
}

export default { updateBloodGroupByAdmin };
