import Department from '../../model/departmentModel';

const addDepartmentByAdminService = async (departmentName: string) => {
    try {
        const department = new Department({ departmentName });
        const result = await department.save();
        return result;

    } catch (error: any) {
        console.error(`Error while adding department: ${error}`);
        throw new Error('An error occurred while adding department.');
    }
};

export default { addDepartmentByAdminService };
