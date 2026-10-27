"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commonErrorMessages_1 = require("../constants/commonErrorMessages");
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });
        if (error) {
            res.status(commonErrorMessages_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                errors: error.details.map((detail) => detail.message)
            });
            return;
        }
        req.body = value;
        next();
    };
};
exports.default = validateBody;
