import { Request, Response, NextFunction } from 'express';
import validateAddCourseTask from '../../middlewares/validateAddCourseTask';

describe('validateAddCourseTask', () => {
    let req: Request;
    let res: Response;
    let next: jest.MockedFunction<NextFunction>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            body: {
                moduleId: '66d323456789abcdef123456',
                taskName: ' Read the docs ',
                type: 'link',
                link: ' https://example.com '
            },
            files: undefined
        } as unknown as Request;
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = { status: statusMock } as unknown as Response;
        next = jest.fn();
    });

    it('normalizes valid fields and passes valid LINK task requests', () => {
        validateAddCourseTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            moduleId: '66d323456789abcdef123456',
            taskName: 'Read the docs',
            type: 'LINK',
            link: 'https://example.com'
        });
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('rejects LINK tasks without a valid link', () => {
        req.body.link = '';

        validateAddCourseTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            errors: expect.arrayContaining([
                'A valid HTTP or HTTPS link is required for LINK tasks.'
            ])
        }));
    });

    it('rejects FILE tasks without an uploaded taskFile', () => {
        req.body.type = 'FILE';

        validateAddCourseTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            errors: expect.arrayContaining(['A file is required for FILE tasks.'])
        }));
    });

    it('accepts FILE tasks when taskFile is uploaded', () => {
        req.body.type = 'FILE';
        req.files = {
            taskFile: [{
                mimetype: 'application/pdf'
            } as Express.Multer.File]
        };

        validateAddCourseTask(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({
            moduleId: '66d323456789abcdef123456',
            taskName: 'Read the docs',
            type: 'FILE',
            link: 'https://example.com'
        });
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('requires a task description for CODE tasks', () => {
        req.body.type = 'CODE';

        validateAddCourseTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            errors: expect.arrayContaining([
                'Task description is required for coding tasks.'
            ])
        }));
    });

    it('rejects unsupported thumbnail MIME types', () => {
        req.files = {
            thumbnailFile: [{
                mimetype: 'image/gif'
            } as Express.Multer.File]
        };

        validateAddCourseTask(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            errors: expect.arrayContaining([
                'Thumbnail must be a JPG, PNG, or WEBP image.'
            ])
        }));
    });
});
