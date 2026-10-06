import axios from 'axios';
import executeCodeService from '../../../services/common/executeCodeService';

jest.mock('axios', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn()
    }
}));

const axiosGetMock = axios.get as jest.Mock;
const axiosPostMock = axios.post as jest.Mock;

describe('executeCodeService Wandbox compiler lookup', () => {
    beforeEach(() => {
        axiosGetMock.mockReset();
        axiosPostMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('retries a compiler-list 500 and reuses the last known list if refresh remains unavailable', async () => {
        const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);
        const upstreamError = Object.assign(
            new Error('Request failed with status code 500'),
            { response: { status: 500 } }
        );
        axiosGetMock.mockRejectedValue(upstreamError);
        const unavailableRun = await executeCodeService.executeCode({
            language: 'javascript',
            code: 'console.log("ok")'
        });

        expect(unavailableRun.status).toBe('EXECUTION_ERROR');
        expect(axiosGetMock).toHaveBeenCalledTimes(3);

        axiosGetMock.mockReset();
        axiosGetMock
            .mockRejectedValueOnce(upstreamError)
            .mockRejectedValueOnce(upstreamError)
            .mockResolvedValueOnce({
                data: [{
                    name: 'nodejs-20',
                    version: '20',
                    language: 'JavaScript'
                }]
            })
            .mockRejectedValue(upstreamError);
        axiosPostMock.mockResolvedValue({
            data: {
                status: '0',
                program_output: 'ok'
            }
        });

        const firstRun = await executeCodeService.executeCode({
            language: 'javascript',
            code: 'console.log("ok")'
        });

        expect(firstRun.status).toBe('COMPLETED');
        expect(axiosGetMock).toHaveBeenCalledTimes(3);

        nowSpy.mockReturnValue(1_000 + 11 * 60 * 1000);
        const secondRun = await executeCodeService.executeCode({
            language: 'javascript',
            code: 'console.log("ok")'
        });

        expect(secondRun.status).toBe('COMPLETED');
        expect(axiosGetMock).toHaveBeenCalledTimes(6);
        expect(axiosPostMock).toHaveBeenCalledTimes(2);
    });
});
