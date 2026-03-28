import Employmentrole from '../../model/employeeRole';
import { IDeleteEmployeeRoleResponse } from '../../interfaces/employeerole';

const deleteEmployeeRoleByAdmin = async (
  id: any
): Promise<IDeleteEmployeeRoleResponse> => {
  try {
    const result = await Employmentrole.findByIdAndDelete({ _id: id });
    if (!result) {
      return { success: false, responseAfterDelete: result };
    }

    return { success: true, responseAfterDelete: result };
  } catch (error: any) {
    console.error(`Error in deleting employment type: ${error}`);
    return { success: false, responseAfterDelete: error };
  }
};

export default { deleteEmployeeRoleByAdmin };
