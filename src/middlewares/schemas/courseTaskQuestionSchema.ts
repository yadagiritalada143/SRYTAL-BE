import Joi from 'joi';
import { MAX_QUESTIONS_PER_TASK } from '../../constants/contentwriter/coursetaskQuestionMessages';

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('must be a valid 24-character id');

const questionFields = {
    question: Joi.string().trim().min(1).max(20000).required(),
    description: Joi.string().allow('').max(20000).optional().default('')
};

/**
 * Neither add nor update accepts `starterCode`. The boilerplate is generated and
 * cached per question + language on first open, so a writer-supplied starter is
 * never wanted; and an update is a partial `$set`, so a posted starterCode is
 * simply ignored and any cached boilerplate survives untouched.
 */
export const addCourseTaskQuestionSchema = Joi.object({
    taskId: objectId.required(),
    ...questionFields
});

export const updateCourseTaskQuestionSchema = Joi.object({
    taskId: objectId.required(),
    questionId: objectId.required(),
    // Every field is optional on an update: a writer may archive a question or
    // correct only its wording.
    question: Joi.string().trim().min(1).max(20000).optional(),
    description: Joi.string().allow('').max(20000).optional(),
    status: Joi.string().trim().uppercase().valid('ACTIVE', 'ARCHIVE').optional()
});

export const courseTaskQuestionIdParamsSchema = Joi.object({
    taskId: objectId.required(),
    questionId: objectId.required()
});

export const courseTaskIdParamsSchema = Joi.object({
    taskId: objectId.required()
});

export { MAX_QUESTIONS_PER_TASK };
