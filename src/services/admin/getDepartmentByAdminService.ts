import IDepartment from '../../interfaces/department';
import DepartmentModel from '../../model/departmentModel';

const getDepartmentByAdmin = async (_id: string): Promise<IDepartment | null> => {
    try {
        return await DepartmentModel.findOne({_id});
    } catch (error: any) {
        throw new Error('Error in fetching department details');
    };
};

export default { getDepartmentByAdmin };
