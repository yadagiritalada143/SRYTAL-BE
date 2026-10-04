
import mongoose from 'mongoose';
import { ICodeRun } from '../interfaces/codeRun';

/**
 * Stores:
 * 1. The latest Run/Re-run snapshot for an employee.
 * 2. Submission snapshots for an employee's coding question.
 *
 * Run records are updated on every Re-run.
 * Submit records can be created multiple times to maintain submission history.
 */
const CodeRunSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
            index: true
        },

        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseTaskModel',
            required: true,
            index: true
        },

        /**
         * Identifies which coding question inside the task
         * this execution belongs to.
         */
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        /**
         * Programming language selected by the employee.
         */
        languageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProgrammingLanguagesSchema',
            required: true
        },

        /**
         * Latest source code executed/submitted by the employee.
         */
        sourceCode: {
            type: mongoose.Schema.Types.String,
            required: true
        },

        /**
         * Test-case execution results.
         */
        results: [
            {
                name: {
                    type: mongoose.Schema.Types.String
                },

                input: {
                    type: mongoose.Schema.Types.String
                },

                expectedOutput: {
                    type: mongoose.Schema.Types.String
                },

                actualOutput: {
                    type: mongoose.Schema.Types.String
                },

                passed: {
                    type: mongoose.Schema.Types.Boolean
                },

                status: {
                    type: mongoose.Schema.Types.String
                },

                stderr: {
                    type: mongoose.Schema.Types.String
                },

                compilationError: {
                    type: mongoose.Schema.Types.String
                },

                runtimeError: {
                    type: mongoose.Schema.Types.String
                },

                executionTimeMs: {
                    type: mongoose.Schema.Types.Number
                },

                errorDetails: {
                    type: mongoose.Schema.Types.String
                }
            }
        ],

        /**
         * Number of test cases passed.
         */
        passedCount: {
            type: mongoose.Schema.Types.Number,
            default: 0
        },

        /**
         * Number of test cases failed.
         */
        failedCount: {
            type: mongoose.Schema.Types.Number,
            default: 0
        },

        /**
         * Score calculated from test-case execution.
         */
        score: {
            type: mongoose.Schema.Types.Number,
            default: 0
        },

        /**
         * AI code-quality evaluation.
         *
         * This should normally be populated only during Submit.
         */
        aiEvaluation: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        /**
         * Overall execution/submission status.
         */
        status: {
            type: mongoose.Schema.Types.String,
            default: 'PENDING'
        },

        /**
         * run:
         *   Latest Run/Re-run snapshot.
         *
         * submit:
         *   Submission history.
         */
        type: {
            type: mongoose.Schema.Types.String,
            enum: ['run', 'submit'],
            default: 'run',
            index: true
        }
    },
    {
        collection: 'code-executions',
        timestamps: true,

        toObject: {
            virtuals: true
        },

        toJSON: {
            virtuals: true
        }
    }
);

/**
 * Run/Re-run lookup.
 *
 * The service uses:
 *
 * userId
 * + taskId
 * + questionId
 * + languageId
 * + type = "run"
 *
 * This index makes that lookup efficient.
 *
 * IMPORTANT:
 * Do NOT make this unique because submit records
 * can have multiple histories.
 */
CodeRunSchema.index({
    userId: 1,
    taskId: 1,
    questionId: 1,
    languageId: 1,
    type: 1
});

/**
 * Used for checking task completion:
 * how many distinct coding questions the employee
 * has successfully completed.
 */
CodeRunSchema.index({
    userId: 1,
    taskId: 1,
    type: 1,
    status: 1
});

const CodeRunModel = mongoose.model<ICodeRun>(
    'CodeRunModel',
    CodeRunSchema
);

export default CodeRunModel;
