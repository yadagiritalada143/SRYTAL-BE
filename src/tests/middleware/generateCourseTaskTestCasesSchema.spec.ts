import generateCourseTaskTestCasesSchema from '../../middlewares/schemas/generateCourseTaskTestCasesSchema';

describe('generateCourseTaskTestCasesSchema', () => {
    const validRequest = {
        taskId: '66d323456789abcdef123456'
    };

    it('requires a valid task ID and does not require a separate question ID', () => {
        expect(generateCourseTaskTestCasesSchema.validate(validRequest).error)
            .toBeUndefined();
        expect(
            generateCourseTaskTestCasesSchema.validate({
                taskId: validRequest.taskId
            }).error
        ).toBeUndefined();
        expect(
            generateCourseTaskTestCasesSchema.validate({
                taskId: 'invalid'
            }).error
        ).toBeDefined();
    });

    it('defaults forceRegenerate to false and accepts an explicit boolean', () => {
        expect(generateCourseTaskTestCasesSchema.validate(validRequest).value)
            .toMatchObject({ forceRegenerate: false });
        expect(
            generateCourseTaskTestCasesSchema.validate({
                ...validRequest,
                forceRegenerate: true
            }).value
        ).toMatchObject({ forceRegenerate: true });
    });
});
