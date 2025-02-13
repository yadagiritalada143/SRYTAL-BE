import Employeerole from '../../model/employeeRole';

interface updateEmployeeRoleResponse {
    success: boolean;
    responseAfterUpdate?: any;
}

const updateEmployeeRoleByAdmin = async (id: string, designation: string): Promise<updateEmployeeRoleResponse> => {
    try {
        const result = await Employeerole.updateMany({ _id: id }, { designation });
        if (!result) {
            return { success: false };
        }

        return { success: true, responseAfterUpdate: result };
    } catch (error: any) {
        console.error(`Error in updating employee role: ${error}`);
        return { success: false, responseAfterUpdate: error }
    }
}

export default { updateEmployeeRoleByAdmin }
