import { Request, Response } from "express";
import applyLeaveService from '../../services/common/applyLeaveService';
import { LEAVE_ERRORS_MESSAGES, LEAVE_SUCCESS_MESSAGES } from '../../constants/common/leaveMessages';

const calculateNumberOfDays = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diffDays = Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24));
    return diffDays + 1;
};

const applyLeave = async (req: Request, res: Response) => {
    try {
        const employeeId = (req as any).user?.userId;
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: LEAVE_ERRORS_MESSAGES.LEAVE_MISSING_FIELDS_MESSAGE
            });
        }

        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                success: false,
                message: LEAVE_ERRORS_MESSAGES.LEAVE_INVALID_DATE_RANGE_MESSAGE
            });
        }

        const numberOfDays = calculateNumberOfDays(new Date(startDate), new Date(endDate));

        const leave = await applyLeaveService.applyLeave({
            employeeId,
            leaveType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            numberOfDays,
            reason
        });

        res.status(201).json({
            success: true,
            message: LEAVE_SUCCESS_MESSAGES.LEAVE_CREATE_SUCCESS_MESSAGE,
            data: leave
        });
    } catch (error: any) {
        console.error(`Error in applying for leave: ${error.message}`);
        res.status(400).json({
            success: false,
            message: LEAVE_ERRORS_MESSAGES.LEAVE_CREATE_ERROR_MESSAGE
        });
    }
};

export default { applyLeave };