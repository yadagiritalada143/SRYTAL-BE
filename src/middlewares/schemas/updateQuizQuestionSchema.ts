// import Joi from 'joi';

// const optionSchema = Joi.object({
//     value: Joi.string().trim().min(1).required(),
//     isanswer: Joi.boolean()
// });

// const updateQuizQuestionSchema = Joi.object({
//     question: Joi.string().trim().min(1).max(5000),
//     type: Joi.string().trim().uppercase().valid('RADIO', 'CHECKBOX', 'TOGGLE', 'DROPDOWN', 'TEXTAREA'),
//     options: Joi.array().items(optionSchema),
//     status: Joi.string().trim().uppercase().valid('SHOW', 'HIDE')
// }).min(1);

// export default updateQuizQuestionSchema;
