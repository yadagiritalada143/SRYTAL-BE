import Joi from 'joi';

const reorderCourseModulesSchema = Joi.object({
    courseId: Joi.string().hex().length(24).required().messages({
        'any.required': 'Course id is required !',
        'string.base': 'Course id must be a valid ID.',
        'string.hex': 'Course id must be a valid ID.',
        'string.length': 'Course id must be a valid ID.'
    }),
    modules: Joi.array()
        .items(
            Joi.object({
                moduleId: Joi.string().hex().length(24).required().messages({
                    'any.required': 'Module ID is required.',
                    'string.base': 'Module ID must be a valid ID.',
                    'string.hex': 'Module ID must be a valid ID.',
                    'string.length': 'Module ID must be a valid ID.'
                }),
                orderIdx: Joi.number().integer().min(1).required().messages({
                    'any.required': 'orderIdx is required !',
                    'number.base': 'orderIdx must be a number !',
                    'number.integer': 'orderIdx must be an integer !',
                    'number.min': 'orderIdx must be greater than or equal to 1 !'
                })
            }).required()
        )
        .min(1)
        .required()
        .custom((modules: { moduleId: string; orderIdx: number }[], helpers) => {
            const moduleIds = modules.map((module) => module.moduleId);
            if (new Set(moduleIds).size !== moduleIds.length) {
                return helpers.error('any.invalid');
            }

            const orderIdxs = modules.map((module) => module.orderIdx);
            if (new Set(orderIdxs).size !== orderIdxs.length) {
                return helpers.error('any.invalid');
            }

            return modules;
        })
        .messages({
            'any.required': 'Modules array is required !',
            'array.base': 'Modules must be an array !',
            'array.min': 'Modules array must contain at least one module !',
            'array.includesRequiredUnknowns': 'Each module must contain a valid moduleId and orderIdx !',
            'any.invalid': 'Duplicate module IDs or orderIdx values are not allowed !'
        })
}).required();

export default reorderCourseModulesSchema;
