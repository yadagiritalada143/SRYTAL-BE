import Departmentmodel from '../../model/departmentModel';
import { FetchDepartmentsResponse } from '../../interfaces/department';

const getAllDepartmentsByAdmin = async (): Promise<FetchDepartmentsResponse> => {
    try {
        const departments = await Departmentmodel.find({});

        if (!departments) {
            throw { success: false };
        }

        return {
            success: true,
            departments: departments
        };
    } catch (error) {
        console.error(`Error in fetching Departments: ${error}`);
        throw { success: false };
    }
};

export default { getAllDepartmentsByAdmin };
