import Joi from 'joi';

const cloneCourseSchema = Joi.object({
    courseId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            'any.required': 'Source course id is required.',
            'string.hex': 'Source course id must be a valid ID.',
            'string.length': 'Source course id must be a valid ID.'
        }),
    courseName: Joi.string()
        .trim()
        .min(1)
        .max(150)
        .required()
        .messages({
            'any.required': 'Course name is required.',
            'string.empty': 'Course name is required.',
            'string.min': 'Course name is required.',
            'string.max': 'Course name must be at most 150 characters.'
        }),
    modules: Joi.array()
        .items(
            Joi.object({
                moduleId: Joi.string()
                    .hex()
                    .length(24)
                    .required()
                    .messages({
                        'any.required': 'Module id is required.',
                        'string.hex': 'Module id must be a valid ID.',
                        'string.length': 'Module id must be a valid ID.'
                    }),
                taskIds: Joi.array()
                    .items(
                        Joi.string()
                            .hex()
                            .length(24)
                            .messages({
                                'string.hex': 'Task id must be a valid ID.',
                                'string.length': 'Task id must be a valid ID.'
                            })
                    )
                    .unique()
                    .default([])
            })
        )
        .min(1)
        .required()
        .messages({
            'any.required': 'At least one module must be selected.',
            'array.min': 'At least one module must be selected.'
        })
}).required();

export default cloneCourseSchema;
