import Employmenttype from '../../model/employmentTypeModel';
import { IDeleteEmploymentTypeResponse } from '../../interfaces/employmenttype';

const deleteEmploymentTypeByAdmin = async (
  id: any
): Promise<IDeleteEmploymentTypeResponse> => {
  try {
    const result = await Employmenttype.findByIdAndDelete({ _id: id });
    if (!result) {
      return { success: false };
    }

    return { success: true, responseAfterDelete: result };
  } catch (error: any) {
    console.error(`Error in deleting employment type: ${error}`);
    return { success: false, responseAfterDelete: error };
  }
};

export default { deleteEmploymentTypeByAdmin };
