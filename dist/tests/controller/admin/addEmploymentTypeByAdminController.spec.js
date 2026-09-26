"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addEmploymentTypeByAdminController_1 = __importDefault(require("../../../controllers/admin/addEmploymentTypeByAdminController"));
const addEmploymentTypeByAdminService_1 = __importDefault(require("../../../services/admin/addEmploymentTypeByAdminService"));
const employementTypesMessages_1 = require("../../../constants/admin/employementTypesMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/addEmploymentTypeByAdminService', () => ({
    __esModule: true,
    default: {
        addEmploymentTypeByAdmin: jest.fn()
    }
}));
const addEmploymentTypeByAdminServiceMock = addEmploymentTypeByAdminService_1.default.addEmploymentTypeByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addEmploymentTypeByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addEmploymentTypeByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 201 with the success message when the employment type is saved with an id', async () => {
        const req = { body: { employmentType: 'Full-Time' } };
        addEmploymentTypeByAdminServiceMock.mockResolvedValue({ id: 'et123', employmentType: 'Full-Time' });
        await addEmploymentTypeByAdminController_1.default.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('Full-Time');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: employementTypesMessages_1.EMPLOYMENT_TYPE_SUCCESS_MESSAGES.EMPLOYMENT_TYPE_ADD_SUCCESS_MESSAGE
        });
    });
    it('returns 400 with the error message when the saved employment type has no id', async () => {
        const req = { body: { employmentType: 'Full-Time' } };
        addEmploymentTypeByAdminServiceMock.mockResolvedValue({ success: false });
        await addEmploymentTypeByAdminController_1.default.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('Full-Time');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_ADD_ERROR_MESSAGE
        });
    });
    it('passes undefined through when the body does not contain an employment type', async () => {
        const req = { body: {} };
        addEmploymentTypeByAdminServiceMock.mockResolvedValue({ id: 'et123' });
        await addEmploymentTypeByAdminController_1.default.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
    });
    it('returns 500 with the unexpected error message when the service throws', async () => {
        const req = { body: { employmentType: 'Full-Time' } };
        addEmploymentTypeByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await addEmploymentTypeByAdminController_1.default.addEmploymentTypeByAdmin(req, res);
        await flushMicrotasks();
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addEmploymentTypeByAdminServiceMock).toHaveBeenCalledWith('Full-Time');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            message: employementTypesMessages_1.EMPLOYMENT_TYPE_ERRORS_MESSAGES.EMPLOYMENT_TYPE_UNEXPECTED_ERROR_MESSAGE
        });
    });
});
