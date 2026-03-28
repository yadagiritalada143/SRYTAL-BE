import Employeerole from '../../model/employeeRole';
import { IFetchEmployeeRolesResponse } from '../../interfaces/employeerole';

const getAllEmployeeRolesByAdmin = (): Promise<IFetchEmployeeRolesResponse> => {
  return new Promise((resolve, reject) => {
    Employeerole.find({})
      .then((employeeRoles: any) => {
        if (!employeeRoles) {
          reject({ success: false });
        } else {
          resolve({
            success: true,
            employeeRoles: employeeRoles,
          });
        }
      })
      .catch((error: any) => {
        console.error(`Error in fetching Employee roles: ${error}`);
        reject({ success: false });
      });
  });
};

export default { getAllEmployeeRolesByAdmin };
