import Employmenttype from '../../model/employmentTypeModel';
import { IFetchEmploymentTypeResponse } from '../../interfaces/employmenttype';

const getAllEmploymentTypesByAdmin =
  (): Promise<IFetchEmploymentTypeResponse> => {
    return new Promise((resolve, reject) => {
      Employmenttype.find({})
        .then((employmentTypesList: any) => {
          if (!employmentTypesList) {
            reject({ success: false });
          } else {
            resolve({
              success: true,
              employmentTypesList: employmentTypesList,
            });
          }
        })
        .catch((error: any) => {
          console.error(`Error in fetching Employmenttype:${error}`);
          reject({ success: false });
        });
    });
  };

export default { getAllEmploymentTypesByAdmin };
