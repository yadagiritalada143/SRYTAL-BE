import Department from '../../model/departmentModel';
import { deleteDepartmentResponse } from '../../interfaces/department';

const deleteDepartmentByAdmin = async (
  _id: string
): Promise<deleteDepartmentResponse> => {
  try {
    const department = await Department.findByIdAndDelete(_id);
    if (!department) {
      return { success: true, responseAfterDelete: department };
    } else {
      return { success: false, responseAfterDelete: department };
    }
  } catch (error: any) {
    console.error(`Error in deleting department: ${error}`);
    throw error;
  }
};

export default { deleteDepartmentByAdmin };
