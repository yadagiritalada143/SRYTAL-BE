import Employeerole from '../../model/employeeRole';

const addEmployeeRoleByAdmin = async (designation: string) => {
    try {
        const employeeRoleToSave: any = new Employeerole({ designation });
        const result = await employeeRoleToSave.save();
        return result;
    } catch (error: any) {
        console.error(`Error in adding employee role: ${error}`);
        return { success: false };
    }
};

export default { addEmployeeRoleByAdmin }
