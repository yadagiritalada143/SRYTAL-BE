import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validateRegistrationSchema = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                errors: error.details.map(err => err.message),
            });
        }

        req.body = value;
        next();
    };
};


export default validateRegistrationSchema;
