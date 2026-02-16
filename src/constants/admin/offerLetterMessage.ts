export const OFFER_LETTER_MESSAGE = {
    OFFER_LETTER_GENERATED_SUCCESS: 'Offer letter generated successfully !!',
    
};

export const OFFER_LETTER_ERROR_MESSAGES = {
    OFFER_LETTER_GENERATION_FAILED: 'Failed to generate offer letter !!',

};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;
