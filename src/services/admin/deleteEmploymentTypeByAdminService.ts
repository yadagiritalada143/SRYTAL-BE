import Employmenttype from '../../model/employmentTypeModel';

interface deleteEmploymentTypeResponse {
    success: boolean;
    responseAfterDelete?: any;
}

const DeleteEmploymentTypeByAdmin = async (id: any):Promise<deleteEmploymentTypeResponse>=> {
    try {
        const result = await Employmenttype.findByIdAndDelete({ _id: id });
        if(result) {
            return {success: true, responseAfterDelete: result};
        } else {
            return {success: false};
        }
    } catch(error: any) {
        console.error('Error in  deleting employment type: ', error);
        return {success: false, responseAfterDelete: error}
    }
}

export default { DeleteEmploymentTypeByAdmin };

