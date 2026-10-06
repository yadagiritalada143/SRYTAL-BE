import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validates route params (`:taskId`, `:questionId`, ...). validateRegistrationSchema
 * only looks at req.body, so id-bearing routes need this to reject a malformed id
 * with a 400 instead of letting it reach a model and come back as a CastError 500.
 */
const validateParamsSchema = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                errors: error.details.map(err => err.message),
            });
        }

        next();
    };
};

export default validateParamsSchema;
