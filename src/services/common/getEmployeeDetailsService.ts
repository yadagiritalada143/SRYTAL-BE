import UserModel from '../../model/userModel';

interface getEmployeeDetailsResponse {
  success: boolean;
  employeeDetails?: any;
}

const getEmployeeDetails = (id: string): Promise<getEmployeeDetailsResponse> => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({ _id: id })
      .populate('bloodGroup')
      .populate('employeeRole')
      .populate('employmentType')
      .populate('organization')
      .then((employee: any) => {
        if (!employee) {
          reject({ success: false });
        } else {
          resolve({
            success: true,
            employeeDetails: {
              id: employee.id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              email: employee.email,
              mobileNumber: employee.mobileNumber,
              bloodGroup: employee.bloodGroup,
              bankDetailsInfo: employee.bankDetailsInfo,
              employeeRole: employee.employeeRole,
              employmentType: employee.employmentType,
              organization: employee.organization,
              userRole: employee.userRole,
              passwordResetRequired: employee.passwordResetRequired,
            }
          });
        }
      })
      .catch((error: any) => {
        console.error('Error in getting employee details:', error);
        reject({ success: false });
      });
  });
}

export default { getEmployeeDetails }
