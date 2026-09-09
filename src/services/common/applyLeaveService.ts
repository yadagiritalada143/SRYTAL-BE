import LeaveModel from '../../model/leaveModel';
import UserModel from '../../model/userModel';
import sendLeaveApplyEmail from '../../util/sendLeaveApplyEmail';

interface IApplyLeavePayload {
    employeeId: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    numberOfDays: number;
    reason?: string;
}

const applyLeave = async (payload: IApplyLeavePayload) => {
    try {
        const { employeeId, leaveType, startDate, endDate, numberOfDays, reason } = payload;

        const employee = await UserModel.findById(employeeId)
            .select('firstName lastName email')
            .lean();

        if (!employee || !employee.email) {
            throw new Error('Employee details not found');
        }

        const newLeave = new LeaveModel({
            employeeId,
            leaveType,
            startDate,
            endDate,
            numberOfDays,
            reason: reason || '',
            status: 'Pending',
            rejectionReason: '',
            notificationEmailSent: false,
            employeeNotificationEmailSent: false
        });

        const savedLeave = await newLeave.save();

        // Send the admin notification email only after the leave is created.
        // Email failures are logged and must not roll back or change the leave status.
        try {
            const adminDetails = await UserModel.find({ userRole: 'admin' })
                .select('firstName lastName email')
                .lean();

            const adminEmails = adminDetails
                .filter(admin => admin && admin.email)
                .map(admin => admin.email as string);

            const adminEmail = adminEmails.length > 0
                ? adminEmails.join(', ')
                : (process.env.ADMIN_EMAIL_ABOUT_CUSTOMER || '');

            if (adminEmail) {
                await sendLeaveApplyEmail.sendLeaveApplyEmail({
                    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email,
                    employeeEmail: employee.email,
                    adminEmail,
                    leaveType,
                    startDate,
                    endDate,
                    numberOfDays,
                    reason,
                    status: 'Pending'
                });

                // Mark as notified so we never re-send the same notification.
                await LeaveModel.updateOne(
                    { _id: savedLeave._id },
                    { $set: { notificationEmailSent: true } }
                );
            }
        } catch (emailError: any) {
            console.error(`Error in sending leave apply email: ${emailError.message}`);
        }

        return savedLeave;
    } catch (error: any) {
        console.error(`Error in applying for leave: ${error.message}`);
        throw error;
    }
};

export default { applyLeave };