import downloadSalarySlipService from '../../../services/common/downloadSalarySlipService';
import s3Client from '../../../util/s3Client';
import { bucketName, salarySlipsFolder } from '../../../config/awsS3Config';

jest.mock('../../../util/s3Client', () => ({
    __esModule: true,
    default: { headObject: jest.fn(), getSignedUrl: jest.fn() }
}));

const headObjectMock = (s3Client as unknown as { headObject: jest.Mock }).headObject;
const getSignedUrlMock = (s3Client as unknown as { getSignedUrl: jest.Mock }).getSignedUrl;

describe('downloadSalarySlipService', () => {
    let promiseMock: jest.Mock;

    beforeEach(() => {
        headObjectMock.mockReset();
        getSignedUrlMock.mockReset();
        promiseMock = jest.fn();
        headObjectMock.mockReturnValue({ promise: promiseMock });
        getSignedUrlMock.mockReturnValue('https://signed-url/slip.pdf');
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns a pre-signed download URL when the file exists', async () => {
        promiseMock.mockResolvedValue({ ContentLength: 100 });

        const result = await downloadSalarySlipService.downloadSalarySlip({
            mongoId: 'u1',
            fullName: 'John A Doe',
            month: 'Feb',
            year: '2026'
        });

        expect(headObjectMock).toHaveBeenCalledWith({
            Bucket: bucketName,
            Key: `${salarySlipsFolder}/u1/John-A-Doe-Feb-2026.pdf`
        });
        expect(getSignedUrlMock).toHaveBeenCalledWith('getObject', {
            Bucket: bucketName,
            Key: `${salarySlipsFolder}/u1/John-A-Doe-Feb-2026.pdf`,
            Expires: 300
        });
        expect(result).toEqual({
            success: true,
            downloadUrl: 'https://signed-url/slip.pdf',
            fileName: 'John-A-Doe-Feb-2026.pdf'
        });
    });

    it('returns SALARY_SLIP_NOT_FOUND when the object is missing (NotFound)', async () => {
        promiseMock.mockRejectedValue({ code: 'NotFound' });

        const result = await downloadSalarySlipService.downloadSalarySlip({
            mongoId: 'u1',
            fullName: 'John Doe',
            month: 'Feb',
            year: '2026'
        });

        expect(result).toEqual({ success: false, error: 'SALARY_SLIP_NOT_FOUND' });
    });

    it('returns SALARY_SLIP_NOT_FOUND when the object is missing (NoSuchKey)', async () => {
        promiseMock.mockRejectedValue({ code: 'NoSuchKey' });

        const result = await downloadSalarySlipService.downloadSalarySlip({
            mongoId: 'u1',
            fullName: 'John Doe',
            month: 'Feb',
            year: '2026'
        });

        expect(result).toEqual({ success: false, error: 'SALARY_SLIP_NOT_FOUND' });
    });

    it('throws for other S3 errors', async () => {
        promiseMock.mockRejectedValue({ code: 'GenericError', message: 'access denied' });

        await expect(
            downloadSalarySlipService.downloadSalarySlip({ mongoId: 'u1', fullName: 'John Doe', month: 'Feb', year: '2026' })
        ).rejects.toThrow('Failed to fetch salary slip from S3');
    });
});