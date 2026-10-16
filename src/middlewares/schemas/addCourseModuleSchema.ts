import Joi from 'joi';

const addCourseModuleSchema = Joi.object({
    courseId: Joi.string().hex().length(24).required().messages({
            'any.required': 'Course id is required !',
            'string.hex': 'Course id must be a valid ID.',
            'string.length': 'Course id must be a valid ID.'
        }),
    moduleName: Joi.string() .trim() .min(1) .max(150).required().messages({
            'any.required': 'Module Name is required !',
            'string.empty': 'Module Name is required !',
            'string.min': 'Module Name is required !',
            'string.max': 'Module Name must be at most 150 characters.'
        }),
    moduleDescription: Joi.string().trim().allow('').optional()
}).required();

const updateCourseModuleSchema = Joi.object({
    id: Joi.string().hex().length(24).required().messages({
            'any.required': 'Module ID is required.',
            'string.hex': 'Module ID must be a valid ID.',
            'string.length': 'Module ID must be a valid ID.'
        }),
    moduleName: Joi.string().trim().min(1).max(150).required().messages({
            'any.required': 'Module Name is required !',
            'string.empty': 'Module Name is required !',
            'string.min': 'Module Name is required !',
            'string.max': 'Module Name must be at most 150 characters.'
        }),
    moduleDescription: Joi.string().trim().allow('').optional(),
    status: Joi.string().trim().uppercase().valid('ACTIVE', 'ARCHIVE').required().messages({
            'any.required': 'Please provide valid status !',
            'any.only': 'Please provide valid status !',
            'string.empty': 'Please provide valid status !'
        })
}).required();


export { addCourseModuleSchema, updateCourseModuleSchema };
