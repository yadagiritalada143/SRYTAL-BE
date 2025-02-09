import { any } from 'joi';
import Employmenttype from '../../model/employmentTypeModel'

interface updateEmploymentTypeResponse {
    success: boolean;
    responseAfterupdate?: any;
}

const updateEmploymentTypeByAdmin = async (id: string, employmentType: string): Promise<updateEmploymentTypeResponse> => {
    try {
        const result = await Employmenttype.updateMany({ _id: id }, { employmentType });
        if (result) {
            return { success: true, responseAfterupdate: result };
        } else {
            return { success: false };
        }
    } catch (error: any) {
        console.error('Error in  updating employment type: ', error);
        return { success: false, responseAfterupdate: error }
    }
}

export default { updateEmploymentTypeByAdmin };

