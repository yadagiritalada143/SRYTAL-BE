import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HTTP_STATUS } from '../constants/commonErrorMessages';

/**
 * Builds an Express middleware that validates `req.body` against the supplied
 * Joi schema. Unknown fields are stripped and all validation failures are
 * returned together (abortEarly: false) so the client can fix them in one go.
 */
const validateBody = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                errors: error.details.map((detail) => detail.message)
            });
            return;
        }

        req.body = value;
        next();
    };
};

export default validateBody;
