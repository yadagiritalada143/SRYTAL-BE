import DepartmentModel from '../../model/departmentModel';
import { updateDepartmentResponse } from '../../interfaces/department';

const updateDepartmentByAdmin = async (_id: string, departmentName: string): Promise<updateDepartmentResponse> => {
    try {
        const result = await DepartmentModel.updateOne({ _id }, { departmentName });
        if (result) {
            return { success: true, departmentResponse: result };
        } else {
            return { success: false, departmentResponse: null };
        }
    } catch (error: any) {
        throw new Error('An error occurred while updating the department.');
    }
};

export default { updateDepartmentByAdmin };
