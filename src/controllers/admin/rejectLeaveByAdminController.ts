import { Request, Response } from "express";
import rejectLeaveByAdminService from '../../services/admin/rejectLeaveByAdminService';
import { LEAVE_BY_ADMIN_ERRORS_MESSAGES, LEAVE_BY_ADMIN_SUCCESS_MESSAGES } from '../../constants/admin/leaveMessages';

const rejectLeave = async (req: Request, res: Response) => {
    try {
        const { leaveId } = req.params;
        const { rejectionReason } = req.body;

        if (!leaveId) {
            return res.status(400).json({
                success: false,
                message: LEAVE_BY_ADMIN_ERRORS_MESSAGES.LEAVE_ID_INVALID_MESSAGE
            });
        }

        const leave = await rejectLeaveByAdminService.rejectLeave(leaveId, rejectionReason);

        return res.status(200).json({
            success: true,
            message: LEAVE_BY_ADMIN_SUCCESS_MESSAGES.LEAVE_REJECT_SUCCESS_MESSAGE,
            data: leave
        });
    } catch (error: any) {
        console.error(`Error in rejecting leave: ${error.message}`);

        if (error.message === LEAVE_BY_ADMIN_ERRORS_MESSAGES.LEAVE_DETAILS_NOT_FOUND_MESSAGE) {
            return res.status(404).json({
                success: false,
                message: LEAVE_BY_ADMIN_ERRORS_MESSAGES.LEAVE_DETAILS_NOT_FOUND_MESSAGE
            });
        }

        if (error.message === LEAVE_BY_ADMIN_ERRORS_MESSAGES.LEAVE_ALREADY_PROCESSED_MESSAGE) {
            return res.status(409).json({
                success: false,
                message: LEAVE_BY_ADMIN_ERRORS_MESSAGES.LEAVE_ALREADY_PROCESSED_MESSAGE
            });
        }

        return res.status(400).json({
            success: false,
            message: LEAVE_BY_ADMIN_ERRORS_MESSAGES.LEAVE_REJECT_ERROR_MESSAGE
        });
    }
};

export default { rejectLeave };