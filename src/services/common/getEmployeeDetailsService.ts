import UserModel from '../../model/userModel';

interface getEmployeeDetailsResponse {
  success: boolean;
  employeeDetails?: any;
}

const formatDate = (date?: Date): string | null => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
};

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
              employeeId: employee.employeeId,
              dateOfBirth: formatDate(employee.dateOfBirth),
              presentAddress: employee.presentAddress,
              permanentAddress: employee.permanentAddress,
              aadharNumber: employee.aadharNumber,
              panCardNumber: employee.panCardNumber,
              uanNumber: employee.uanNumber,
              department: employee.department,
              dateOfJoining: formatDate(employee.dateOfJoining)
            }
          });
        }
      })
      .catch((error: any) => {
        console.error(`Error in getting employee details: ${error}`);
        reject({ success: false });
      });
  });
}

export default { getEmployeeDetails }
