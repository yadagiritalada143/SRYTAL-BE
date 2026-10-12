import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import validateBody from '../../middlewares/validateBody';

describe('validateBody', () => {
    const schema = Joi.object({
        name: Joi.string().trim().min(1).required()
    }).required();

    let req: Request;
    let res: Response;
    let next: jest.MockedFunction<NextFunction>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = { body: {} } as Request;
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = { status: statusMock } as unknown as Response;
        next = jest.fn();
    });

    it('passes, normalizes and strips unknown fields when valid', () => {
        req.body = { name: '  Hello  ', extra: 'ignored' };

        validateBody(schema, 'Invalid request.')(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(req.body).toEqual({ name: 'Hello' });
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('returns 400 with all collected errors when invalid', () => {
        req.body = { name: '' };

        validateBody(schema, 'Invalid request.')(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: 'Invalid request.',
            errors: expect.any(Array)
        }));
    });
});
