import Employmenttype from '../../model/employmentTypeModel';

const addEmploymentTypeByAdmin = async (employmentType: string) => {
    try {
        const employmenttypetosave: any = new Employmenttype({ type: employmentType });
        const result = await employmenttypetosave.save();
        return result;
    } catch (error: any) {
        console.error('Error in adding employment type:', error);
        return { success: false };
    }
};

export default { addEmploymentTypeByAdmin }

