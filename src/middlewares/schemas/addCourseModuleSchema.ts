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
    moduleDescription: Joi.string().trim().allow('').optional(),
   orderIdx: Joi.number()
       .integer()
       .min(0)
       .required()
       .messages({
           'any.required':
               'orderIdx is required and must be a positive integer.',
           'number.base':
               'orderIdx is required and must be a positive integer.',
           'number.integer':
               'orderIdx is required and must be a positive integer.',
           'number.min':
               'orderIdx is required and must be a positive integer.',
       }),
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
        }),
    orderIdx: Joi.number().integer().min(1).required().messages({
            'any.required': 'orderIdx is required and must be a non-negative integer.',
            'number.base': 'orderIdx must be a number.',
            'number.integer': 'orderIdx must be an integer.',
            'number.min': 'orderIdx must be greater than or equal to 0.'
        }),
}).required();

export { addCourseModuleSchema, updateCourseModuleSchema };
