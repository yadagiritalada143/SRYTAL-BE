import updateEmployeeDetailsByAdminService from '../../../services/admin/updateEmployeeDetailsByAdminService';
import UserModel from '../../../model/userModel';

jest.mock('../../../model/userModel', () => {
    const UserModel = jest.fn();
    (UserModel as any).updateOne = jest.fn();
    return { __esModule: true, default: UserModel };
});

const UserModelMock = UserModel as unknown as jest.Mock & { updateOne: jest.Mock };

describe('updateEmployeeDetailsByAdminService', () => {
    beforeEach(() => {
        UserModelMock.mockReset();
        UserModelMock.updateOne = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('updates the profile and returns { success: true }', async () => {
        const userDetailsToUpdate: any = {
            email: 'a@x.com',
            firstName: 'John',
            lastName: 'Doe',
            mobileNumber: '999',
            bloodGroup: 'bg1',
            bankDetailsInfo: { bankName: 'HDFC' },
            employmentType: 'et1',
            employeeRole: 'er1',
            employeeId: 'EMP-1',
            dateOfBirth: new Date('1990-01-15T00:00:00Z'),
            aadharNumber: '1111',
            panCardNumber: 'PAN1',
            uanNumber: 'UAN1',
            department: 'd1',
            dateOfJoining: new Date('2024-03-10T00:00:00Z'),
            presentAddress: 'A1',
            permanentAddress: 'A2'
        };
        UserModelMock.updateOne.mockResolvedValue({ modifiedCount: 1 });

        const result = await updateEmployeeDetailsByAdminService.updateEmployeeProfileByAdmin(userDetailsToUpdate);

        expect(UserModelMock.updateOne).toHaveBeenCalledWith(
            { email: 'a@x.com' },
            {
                firstName: 'John',
                lastName: 'Doe',
                mobileNumber: '999',
                bloodGroup: 'bg1',
                bankDetailsInfo: { bankName: 'HDFC' },
                employmentType: 'et1',
                employeeRole: 'er1',
                employeeId: 'EMP-1',
                dateOfBirth: '15-Jan-1990',
                aadharNumber: '1111',
                panCardNumber: 'PAN1',
                uanNumber: 'UAN1',
                department: 'd1',
                dateOfJoining: '10-Mar-2024',
                presentAddress: 'A1',
                permanentAddress: 'A2'
            }
        );
        expect(result).toEqual({ success: true });
    });

    it('formats absent and invalid dates as null', async () => {
        const userDetailsToUpdate: any = {
            email: 'b@x.com',
            firstName: 'Jane',
            dateOfBirth: undefined,
            dateOfJoining: 'not-a-date'
        };
        UserModelMock.updateOne.mockResolvedValue({});

        const result = await updateEmployeeDetailsByAdminService.updateEmployeeProfileByAdmin(userDetailsToUpdate);

        expect(UserModelMock.updateOne).toHaveBeenCalledWith(
            { email: 'b@x.com' },
            expect.objectContaining({ dateOfBirth: null, dateOfJoining: null })
        );
        expect(result).toEqual({ success: true });
    });

    it('logs and rethrows when the update fails', async () => {
        const userDetailsToUpdate: any = { email: 'c@x.com' };
        const error = new Error('update failed');
        UserModelMock.updateOne.mockRejectedValue(error);

        await expect(updateEmployeeDetailsByAdminService.updateEmployeeProfileByAdmin(userDetailsToUpdate))
            .rejects.toBe(error);
        expect(console.error).toHaveBeenCalled();
    });
});