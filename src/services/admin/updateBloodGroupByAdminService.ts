import { any } from 'joi';
import BloodgroupModel from '../../model/bloodGroupModel'

interface updateBloodGroupResponse {
    success: boolean;
    responseAfterupdate?: any;
}

const updateBloodGroupByAdmin = async (id: string, type: string): Promise<updateBloodGroupResponse> => {
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

