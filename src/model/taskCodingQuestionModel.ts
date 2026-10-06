import mongoose from 'mongoose';

const TaskCodingQuestionSchema = new mongoose.Schema(
    {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseTaskModel', required: true, index: true },

        question: {type: String, required: true,trim: true
        },

        description: {
            type: String,
            default: ''
        },

        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE',
            index: true
        },

        order: {
            type: Number,
            required: true,
            default: 0
        },

        starterCode: [
            {
                languageId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'ProgrammingLanguagesSchema',
                    required: true
                },

                code: {
                    type: String,
                    default: ''
                },

                boilerplateVersion: {
                    type: Number,
                    select: false
                }
            }
        ]
    },
    {
        collection: 'task-coding-questions',
        timestamps: true
    }
);

/**
 * Get questions of a task in order.
 */
TaskCodingQuestionSchema.index({
    taskId: 1,
    order: 1
});

/**
 * Quickly find active questions belonging to a task.
 */
TaskCodingQuestionSchema.index({
    taskId: 1,
    status: 1
});

/**
 * Prevent duplicate question text inside the same task.
 *
 * MongoDB cannot enforce case-insensitive uniqueness with this simple
 * index, so the service also performs the duplicate check.
 */
TaskCodingQuestionSchema.index({
    taskId: 1,
    question: 1
});

const TaskCodingQuestionModel = mongoose.model(
    'TaskCodingQuestionModel',
    TaskCodingQuestionSchema
);

export default TaskCodingQuestionModel;
