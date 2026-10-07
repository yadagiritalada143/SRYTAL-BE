import { Response } from 'express';
import generateOfferLetterBySuperadminService from '../../../services/superadmin/generateOfferLetterBySuperadminService';

const mockText = jest.fn();
const mockMoveDown = jest.fn().mockReturnThis();
const mockFontSize = jest.fn().mockReturnThis();
const mockPipe = jest.fn();
const mockEnd = jest.fn();
const mockSetHeader = jest.fn();

jest.mock('pdfkit', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            text: mockText,
            moveDown: mockMoveDown,
            fontSize: mockFontSize,
            pipe: mockPipe,
            end: mockEnd
        }))
    };
});

describe('generateOfferLetterBySuperadminService', () => {
    let res: Response;

    beforeEach(() => {
        mockText.mockClear();
        mockMoveDown.mockClear();
        mockFontSize.mockClear();
        mockPipe.mockClear();
        mockEnd.mockClear();
        mockSetHeader.mockClear();
        mockMoveDown.mockReturnThis();
        mockFontSize.mockReturnThis();
        mockText.mockReturnThis();
        res = {
            setHeader: mockSetHeader
        } as unknown as Response;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('generates an offer letter PDF with the provided details', async () => {
        await generateOfferLetterBySuperadminService.generateOfferLetterBySuperadmin(
            res,
            'John Doe',
            'Offer Letter',
            'Software Engineer',
            '2026-01-01',
            '1000000',
            'Bangalore'
        );

        expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(mockSetHeader).toHaveBeenCalledWith(
            'Content-Disposition',
            'attachment; filename=John Doe_OfferLetter.pdf'
        );
        expect(mockPipe).toHaveBeenCalledWith(res);
        expect(mockEnd).toHaveBeenCalledTimes(1);
        expect(mockFontSize).toHaveBeenCalledWith(20);
        expect(mockFontSize).toHaveBeenCalledWith(12);
        expect(mockText).toHaveBeenCalledWith('Offer Letter', { align: 'center' });
        expect(mockText).toHaveBeenCalledWith('Dear John Doe,', { align: 'left' });
    });
});
