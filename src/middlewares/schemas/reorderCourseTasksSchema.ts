import Joi from 'joi';

const reorderCourseTasksSchema = Joi.object({
    moduleId: Joi.string().hex().length(24).required().messages({
        'any.required': 'Module ID is required !',
        'string.base': 'Module ID must be a valid ID.',
        'string.hex': 'Module ID must be a valid ID.',
        'string.length': 'Module ID must be a valid ID.'
    }),
    tasks: Joi.array()
        .items(
            Joi.object({
                taskId: Joi.string().hex().length(24).required().messages({
                    'any.required': 'Task ID is required.',
                    'string.base': 'Task ID must be a valid ID.',
                    'string.hex': 'Task ID must be a valid ID.',
                    'string.length': 'Task ID must be a valid ID.'
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
        .custom((tasks: { taskId: string; orderIdx: number }[], helpers) => {
            const taskIds = tasks.map((task) => task.taskId);
            if (new Set(taskIds).size !== taskIds.length) {
                return helpers.error('any.invalid');
            }

            const orderIdxs = tasks.map((task) => task.orderIdx);
            if (new Set(orderIdxs).size !== orderIdxs.length) {
                return helpers.error('any.invalid');
            }

            return tasks;
        })
        .messages({
            'any.required': 'Tasks array is required !',
            'array.base': 'Tasks must be an array !',
            'array.min': 'Tasks array must contain at least one task !',
            'array.includesRequiredUnknowns': 'Each task must contain a valid taskId and orderIdx !',
            'any.invalid': 'Duplicate task IDs or orderIdx values are not allowed !'
        })
}).required();

export default reorderCourseTasksSchema;
