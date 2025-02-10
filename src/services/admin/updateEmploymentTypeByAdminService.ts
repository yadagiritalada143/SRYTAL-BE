import Employmenttype from '../../model/employmentTypeModel';

interface updateEmploymentTypeResponse {
    success: boolean;
    responseAfterUpdate?: any;
}

const updateEmploymentTypeByAdmin = async (id: string, employmentType: string): Promise<updateEmploymentTypeResponse> => {
    try {
        const result = await Employmenttype.updateMany({ _id: id }, { employmentType });
        if (!result) {
            return { success: false };
        }

        return { success: true, responseAfterUpdate: result };
    } catch (error: any) {
        console.error(`Error in  updating employment type: ${error}`);
        return { success: false, responseAfterUpdate: error }
    }
}

export default { updateEmploymentTypeByAdmin }
