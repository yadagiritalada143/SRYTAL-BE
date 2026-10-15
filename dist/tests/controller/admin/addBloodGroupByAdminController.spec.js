"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const addBloodGroupByAdminController_1 = __importDefault(require("../../../controllers/admin/addBloodGroupByAdminController"));
const addBloodGroupByAdminService_1 = __importDefault(require("../../../services/admin/addBloodGroupByAdminService"));
const bloodgroupMessages_1 = require("../../../constants/admin/bloodgroupMessages");
const commonErrorMessages_1 = require("../../../constants/commonErrorMessages");
jest.mock('../../../services/admin/addBloodGroupByAdminService', () => ({
    __esModule: true,
    default: {
        addBloodgroupByAdmin: jest.fn()
    }
}));
const addBloodgroupByAdminServiceMock = addBloodGroupByAdminService_1.default.addBloodgroupByAdmin;
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
describe('addNewBloodgroupByAdmin controller', () => {
    let mockJson;
    let mockStatus;
    let res;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        res = { status: mockStatus, json: mockJson };
        addBloodgroupByAdminServiceMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('returns 201 with the success message when the blood group is saved with an id', async () => {
        const req = { body: { type: 'O+' } };
        addBloodgroupByAdminServiceMock.mockResolvedValue({ id: 'bg123', type: 'O+' });
        await addBloodGroupByAdminController_1.default.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith('O+');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
        expect(mockJson).toHaveBeenCalledWith({
            message: bloodgroupMessages_1.BLOOD_GROUP_SUCCESS_MESSAGES.BLOOD_GROUP_ADD_SUCCESS_MESSAGE
        });
    });
    it('returns 400 with the error message when the saved blood group has no id', async () => {
        const req = { body: { type: 'O+' } };
        addBloodgroupByAdminServiceMock.mockResolvedValue({ success: false });
        await addBloodGroupByAdminController_1.default.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith('O+');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith({
            message: bloodgroupMessages_1.BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_ADD_ERROR_MESSAGE
        });
    });
    it('passes an undefined type through when the body does not contain one', async () => {
        const req = { body: {} };
        addBloodgroupByAdminServiceMock.mockResolvedValue({ id: 'bg123' });
        await addBloodGroupByAdminController_1.default.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith(undefined);
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.CREATED);
    });
    it('returns 500 with the unexpected error message when the service throws', async () => {
        const req = { body: { type: 'O+' } };
        addBloodgroupByAdminServiceMock.mockRejectedValue(new Error('Service failure'));
        await addBloodGroupByAdminController_1.default.addNewBloodgroupByAdmin(req, res);
        await flushMicrotasks();
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledTimes(1);
        expect(addBloodgroupByAdminServiceMock).toHaveBeenCalledWith('O+');
        expect(mockStatus).toHaveBeenCalledWith(commonErrorMessages_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith({
            message: bloodgroupMessages_1.BLOOD_GROUP_ERROR_MESSAGES.BLOOD_GROUP_UNEXPECTED_ERROR_MESSAGE
        });
    });
});
