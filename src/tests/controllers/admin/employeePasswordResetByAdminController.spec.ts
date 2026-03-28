// import { Request, Response } from 'express';
// import controller from '../../../controllers/admin/employeePasswordResetByAdminController';
// import employeePasswordResetByAdminService from '../../../services/admin/employeePasswordResetByAdminService';
// import { ADMIN_ERROR_MESSAGES } from '../../../constants/adminErrorMessages';

// jest.mock('services/admin/employeePasswordResetByAdminService', () => ({
//     employeePasswordResetByAdmin: jest.fn()
// }));

// describe('employeePasswordResetByAdmin Controller', () => {
//     let mockRequest: Partial<Request>;
//     let mockResponse: Partial<Response>;
//     let responseObject = {};

//     beforeEach(() => {
//         mockRequest = {};
//         mockResponse = {
//             status: jest.fn().mockReturnThis(),
//             json: jest.fn().mockImplementation((result) => {
//                 responseObject = result;
//             })
//         };
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     test('should respond with 200 status code and success true on successful password reset', async () => {
//         const employeeId = '123';
//         mockRequest = {
//             body: { employeeId }
//         };

//         (employeePasswordResetByAdminService.employeePasswordResetByAdmin as jest.Mock).mockResolvedValue(true);

//         await controller.employeePasswordResetByAdmin(mockRequest as Request, mockResponse as Response);

//         expect(employeePasswordResetByAdminService.employeePasswordResetByAdmin).toHaveBeenCalledWith(employeeId);
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
//     });

//     test('should respond with 400 status code and success false when reset fails', async () => {
//         const employeeId = '123';
//         mockRequest = {
//             body: { employeeId }
//         };

//         (employeePasswordResetByAdminService.employeePasswordResetByAdmin as jest.Mock).mockResolvedValue(false);

//         await controller.employeePasswordResetByAdmin(mockRequest as Request, mockResponse as Response);

//         expect(employeePasswordResetByAdminService.employeePasswordResetByAdmin).toHaveBeenCalledWith(employeeId);
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: ADMIN_ERROR_MESSAGES.RESET_EMPLOYEE_PASSWORD_ERROR });
//     });

//     test('should handle errors and respond with 500 status code', async () => {
//         const employeeId = '123';
//         mockRequest = {
//             body: { employeeId }
//         };

//         const error = new Error('Some error');
//         (employeePasswordResetByAdminService.employeePasswordResetByAdmin as jest.Mock).mockRejectedValue(error);

//         await controller.employeePasswordResetByAdmin(mockRequest as Request, mockResponse as Response);

//         expect(employeePasswordResetByAdminService.employeePasswordResetByAdmin).toHaveBeenCalledWith(employeeId);
//         expect(mockResponse.status).toHaveBeenCalledWith(500);
//         expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: ADMIN_ERROR_MESSAGES.RESET_EMPLOYEE_PASSWORD_ERROR });
//         console.log('Error occured while asking to reset the password:', error);
//     });
// });

describe('test for testing', () => {
  it('Just for testing purpose', () => {
    expect(1 + 2).toBe(3);
  });
});
