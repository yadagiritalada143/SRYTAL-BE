import LeaveModel from '../../model/leaveModel';
import UserModel from '../../model/userModel';
import sendLeaveRejectionEmail from '../../util/sendLeaveRejectionEmail';

const rejectLeave = async (leaveId: string, rejectionReason?: string) => {
    try {
        const leave = await LeaveModel.findById(leaveId).lean();

        if (!leave) {
            throw new Error('Leave request not found');
        }

        if (leave.status !== 'Pending') {
            throw new Error('Leave request has already been processed');
        }

        await LeaveModel.updateOne(
            { _id: leave._id },
            {
                $set: {
                    status: 'Rejected',
                    rejectionReason: rejectionReason || '',
                    updatedAt: new Date()
                }
            }
        );

        // Send rejection notification to the employee. Guarded by status so a
        // duplicate call never re-sends the email.
        try {
            const employee = await UserModel.findById(leave.employeeId)
                .select('firstName lastName email')
                .lean();

            if (employee && employee.email) {
                await sendLeaveRejectionEmail.sendLeaveRejectionEmail({
                    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
                    employeeEmail: employee.email,
                    leaveType: leave.leaveType,
                    startDate: leave.startDate,
                    endDate: leave.endDate,
                    numberOfDays: leave.numberOfDays,
                    status: 'Rejected',
                    rejectionReason
                });

                await LeaveModel.updateOne(
                    { _id: leave._id },
                    { $set: { employeeNotificationEmailSent: true } }
                );
            }
        } catch (emailError: any) {
            console.error(`Error in sending leave rejection email: ${emailError.message}`);
        }

        return await LeaveModel.findById(leave._id).lean();
    } catch (error: any) {
        console.error(`Error in rejecting leave: ${error.message}`);
        throw error;
    }
};

export default { rejectLeave };