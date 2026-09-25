export const CODING_QUESTION_SUCCESS_MESSAGES = {
    CODING_QUESTION_FETCH_SUCCESS_MESSAGE: 'Coding question fetched successfully !',
    RUN_CODE_SUCCESS_MESSAGE: 'Code executed successfully !',
    SUBMIT_CODE_SUCCESS_MESSAGE: 'Code submitted successfully !'
};

export const CODING_QUESTION_ERROR_MESSAGES = {
    RUN_CODE_MISSING_FIELDS_MESSAGE: 'questionId, language and code are required !',
    QUESTION_NOT_FOUND_MESSAGE: 'Coding question not found !',
    NOT_CODING_QUESTION_MESSAGE: 'This task is not a coding question !',
    QUESTION_NOT_ASSIGNED_MESSAGE: 'This coding question is not part of your assigned courses !',
    INVALID_LANGUAGE_MESSAGE: 'Please provide a valid programming language for this coding question !',
    OPENROUTER_KEY_NOT_FOUND_MESSAGE: 'OpenRouter API key not found. Please add your OpenRouter API key first !',
    OPENROUTER_KEY_INVALID_MESSAGE: 'Your OpenRouter API key is invalid. Please update your OpenRouter API key !',
    OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE: 'Test case generation is taking longer than expected, Please try again !',
    TEST_CASES_GENERATION_FAILED_MESSAGE: 'Failed to generate test cases for this coding question, Please try again !',
    TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE: 'Test cases are being generated for this coding question. Please try again in a moment !',
    INVALID_GENERATED_TEST_CASES_MESSAGE: 'Invalid test cases were generated for this coding question !',
    CODING_QUESTION_FETCH_ERROR_MESSAGE: 'An error occurred while fetching the coding question, Please try again !',
    RUN_CODE_ERROR_MESSAGE: 'An error occurred while executing the code, Please try again !',
    SUBMIT_CODE_ERROR_MESSAGE: 'An error occurred while submitting the code, Please try again !',
    SUBMIT_ALL_TESTS_MUST_PASS_MESSAGE: 'All test cases must pass before you can submit your code !'
};