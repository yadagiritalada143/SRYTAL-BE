export const CODING_TASK_SUCCESS_MESSAGES = {
    CODING_QUESTION_FETCH_SUCCESS_MESSAGE: 'Coding question fetched successfully !',
    RUN_CODE_SUCCESS_MESSAGE: 'Code executed successfully !',
    SUBMIT_CODE_SUCCESS_MESSAGE: 'Code submitted successfully !',
    BOILERPLATE_FETCH_SUCCESS_MESSAGE: 'Coding task boilerplate generated successfully !',
    TEST_CASES_GENERATED_SUCCESS_MESSAGE: 'Coding task test cases generated successfully.',
    TEST_CASES_REUSED_SUCCESS_MESSAGE: 'Existing coding task test cases reused.',
    TEST_CASES_FETCH_SUCCESS_MESSAGE: 'Coding task test cases fetched successfully.',
    SUBMIT_COURSE_TASK_SUCCESS_MESSAGE: 'Coding task submitted successfully.'
};

export const CODING_TASK_ERROR_MESSAGES = {
    RUN_CODE_MISSING_FIELDS_MESSAGE: 'Task, language and code are required !',
    COURSE_TASK_NOT_FOUND_MESSAGE: 'Coding task not found !',
    NOT_CODING_TASK_MESSAGE: 'This task is not a coding task !',
    CODING_TASK_NAME_REQUIRED_MESSAGE: 'Please provide a task name for this coding task !',
    CODING_TASK_DESCRIPTION_REQUIRED_MESSAGE: 'Please provide a coding question for this task !',
    INVALID_LANGUAGE_MESSAGE: 'Please provide a valid programming language for this coding question !',
    BOILERPLATE_GENERATION_FAILED_MESSAGE: 'Unable to generate coding task boilerplate. Please try again !',
    TASK_NOT_ASSIGNED_MESSAGE: 'This coding task is not part of your assigned courses !',
    OPENROUTER_KEY_NOT_FOUND_MESSAGE: 'OpenRouter API key not found. Please add your OpenRouter API key first !',
    OPENROUTER_KEY_INVALID_MESSAGE: 'Your OpenRouter API key is invalid. Please update your OpenRouter API key !',
    OPENROUTER_ACCOUNT_LIMIT_MESSAGE: 'Your OpenRouter account has insufficient credits to generate test cases.',
    INVALID_TEST_CASE_GENERATION_REQUEST_MESSAGE: 'A valid coding task ID is required.',
    OPENROUTER_TEST_CASE_GENERATION_TIMEOUT_MESSAGE: 'Test case generation is taking longer than expected, Please try again !',
    TEST_CASES_GENERATION_FAILED_MESSAGE: 'Failed to generate test cases for this coding question, Please try again !',
    TEST_CASES_GENERATION_IN_PROGRESS_MESSAGE: 'Test cases are being generated for this coding question. Please try again in a moment !',
    INVALID_GENERATED_TEST_CASES_MESSAGE: 'Invalid test cases were generated for this coding question !',
    TEST_CASES_NOT_GENERATED_MESSAGE: 'Test cases have not been generated for this coding task yet.',
    TEST_CASES_FETCH_FAILED_MESSAGE: 'Failed to retrieve coding task test cases.',
    RUN_CODE_ERROR_MESSAGE: 'An error occurred while executing the code, Please try again !',
    SUBMIT_CODE_ERROR_MESSAGE: 'An error occurred while submitting the code, Please try again !',
    SUBMIT_ALL_TESTS_MUST_PASS_MESSAGE: 'Please fix the failed test cases before submitting.',
    SUBMIT_COMPILE_FAILED_MESSAGE: 'Please fix the compilation errors before submitting.',
    SUBMIT_RUN_REQUIRED_MESSAGE: 'Please run the code against the test cases before submitting.',
    SUBMIT_RESULTS_MISMATCH_MESSAGE: 'Your latest execution results do not match this submission. Please run the code again.',
    INVALID_SOURCE_CODE_MESSAGE: 'Please provide valid source code.',
    USER_AUTHENTICATION_REQUIRED_MESSAGE: 'User authentication required !'
};
