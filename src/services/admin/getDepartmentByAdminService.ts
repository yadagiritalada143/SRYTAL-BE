import IDepartment from '../../interfaces/department';
import DepartmentModel from '../../model/departmentModel';

const getDepartmentByAdminService = async (_id: string): Promise<IDepartment | null> => {
    try {
        const departmentDetails = await DepartmentModel.findOne({_id: _id});
        return departmentDetails;

    } catch (error: any) {
        throw new Error('Error in fetching department details');
    };
};

export default { getDepartmentByAdminService };
