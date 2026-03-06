import Departmentmodel from '../../model/departmentModel';
import { FetchAllDepartmentsResponse } from '../../interfaces/department';

const getAllDepartmentByAdminService = async (): Promise<FetchAllDepartmentsResponse> => {
    const departments = await Departmentmodel.find();
    const departmentResponse = departments.map((department) => ({
        _id: department._id,
        departmentName: department.departmentName,
    }));

    return { success: true, departmentResponse: departmentResponse };
};

export default { getAllDepartmentByAdminService };
