import Employmentrole from '../../model/employeeRole';

interface deleteEmployeeRoleResponse {
    success: boolean;
    responseAfterDelete?: any;
}

const deleteEmployeeRoleByAdmin = async (id: any): Promise<deleteEmployeeRoleResponse> => {
    try {
        const result = await Employmentrole.findByIdAndDelete({ _id: id });
        if (!result) {
            return { success: false };
        }

        return { success: true, responseAfterDelete: result };
    } catch (error: any) {
        console.error(`Error in deleting employment type: ${error}`);
        return { success: false, responseAfterDelete: error }
    }
}

export default { deleteEmployeeRoleByAdmin }
