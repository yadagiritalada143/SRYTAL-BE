import Employmenttype from '../../model/employmentTypeModel';

const addEmploymentTypeByAdmin = async (employmentType: string) => {
    try {
        const employmentTypeToSave: any = new Employmenttype({ employmentType });
        const result = await employmentTypeToSave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding employment type:', error);
        return { success: false };
    }
};

export default { addEmploymentTypeByAdmin }
