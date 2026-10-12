import addCourseSchema from '../../middlewares/schemas/addCourseSchema';
import updateCourseSchema from '../../middlewares/schemas/updateCourseSchema';
import addCourseModuleSchema from '../../middlewares/schemas/addCourseModuleSchema';
import updateCourseModuleSchema from '../../middlewares/schemas/updateCourseModuleSchema';
import updateCourseTaskSchema from '../../middlewares/schemas/updateCourseTaskSchema';

const objectId = '66d323456789abcdef123456';

describe('addCourseSchema', () => {
    it('accepts a valid course and trims the name', () => {
        const { error, value } = addCourseSchema.validate({ courseName: '  React  ' });
        expect(error).toBeUndefined();
        expect(value).toEqual({ courseName: 'React' });
    });

    it('rejects a missing or empty course name', () => {
        expect(addCourseSchema.validate({}).error).toBeDefined();
        expect(addCourseSchema.validate({ courseName: '   ' }).error).toBeDefined();
    });
});

describe('updateCourseSchema', () => {
    it('accepts a valid update and uppercases the status', () => {
        const { error, value } = updateCourseSchema.validate({
            id: objectId,
            courseName: 'React',
            status: 'active'
        });
        expect(error).toBeUndefined();
        expect(value.status).toBe('ACTIVE');
    });

    it('rejects an invalid id and an invalid status', () => {
        expect(updateCourseSchema.validate({ id: 'xyz', courseName: 'React', status: 'ACTIVE' }).error).toBeDefined();
        expect(updateCourseSchema.validate({ id: objectId, courseName: 'React', status: 'DRAFT' }).error).toBeDefined();
    });
});

describe('addCourseModuleSchema', () => {
    it('accepts a valid module', () => {
        const { error } = addCourseModuleSchema.validate({ courseId: objectId, moduleName: 'Basics' });
        expect(error).toBeUndefined();
    });

    it('requires a valid courseId and moduleName', () => {
        expect(addCourseModuleSchema.validate({ moduleName: 'Basics' }).error).toBeDefined();
        expect(addCourseModuleSchema.validate({ courseId: 'nope', moduleName: 'Basics' }).error).toBeDefined();
        expect(addCourseModuleSchema.validate({ courseId: objectId }).error).toBeDefined();
    });

    it('accepts an optional acknowledgementText and trims it', () => {
        const { error, value } = addCourseModuleSchema.validate({
            courseId: objectId,
            moduleName: 'Basics',
            acknowledgementText: '  I have read and understood.  '
        });
        expect(error).toBeUndefined();
        expect(value.acknowledgementText).toBe('I have read and understood.');
    });

    it('allows an empty acknowledgementText and omitting the field', () => {
        expect(addCourseModuleSchema.validate({ courseId: objectId, moduleName: 'Basics', acknowledgementText: '' }).error).toBeUndefined();
        expect(addCourseModuleSchema.validate({ courseId: objectId, moduleName: 'Basics' }).error).toBeUndefined();
    });
});

describe('updateCourseModuleSchema', () => {
    it('accepts a valid update', () => {
        const { error } = updateCourseModuleSchema.validate({ id: objectId, moduleName: 'Basics', status: 'archive' });
        expect(error).toBeUndefined();
    });

    it('rejects a missing module name', () => {
        expect(updateCourseModuleSchema.validate({ id: objectId, status: 'ACTIVE' }).error).toBeDefined();
    });

    it('accepts an optional acknowledgementText and trims it', () => {
        const { error, value } = updateCourseModuleSchema.validate({
            id: objectId,
            moduleName: 'Basics',
            status: 'ACTIVE',
            acknowledgementText: '  Updated acknowledgement.  '
        });
        expect(error).toBeUndefined();
        expect(value.acknowledgementText).toBe('Updated acknowledgement.');
    });

    it('allows clearing the acknowledgementText with an empty value', () => {
        const { error, value } = updateCourseModuleSchema.validate({
            id: objectId,
            moduleName: 'Basics',
            status: 'ACTIVE',
            acknowledgementText: ''
        });
        expect(error).toBeUndefined();
        expect(value.acknowledgementText).toBe('');
    });

    it('rejects a non-string acknowledgementText', () => {
        expect(updateCourseModuleSchema.validate({
            id: objectId,
            moduleName: 'Basics',
            status: 'ACTIVE',
            acknowledgementText: 123
        }).error).toBeDefined();
    });
});

describe('updateCourseTaskSchema', () => {
    it('accepts a valid update with a task status', () => {
        const { error, value } = updateCourseTaskSchema.validate({
            id: objectId,
            taskName: 'Read',
            status: 'archive',
            executionMode: 'stdin'
        });
        expect(error).toBeUndefined();
        expect(value.status).toBe('ARCHIVE');
        expect(value.executionMode).toBe('STDIN');
    });

    it('rejects invalid status, execution mode and id', () => {
        expect(updateCourseTaskSchema.validate({ id: objectId, taskName: 'Read', status: 'INACTIVE' }).error).toBeDefined();
        expect(updateCourseTaskSchema.validate({ id: objectId, taskName: 'Read', status: 'ACTIVE', executionMode: 'RUN' }).error).toBeDefined();
        expect(updateCourseTaskSchema.validate({ id: 'bad', taskName: 'Read', status: 'ACTIVE' }).error).toBeDefined();
    });
});
