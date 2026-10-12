import { withAcknowledgementState, buildCourseModules } from '../../util/manageCourseProgress';

describe('manageCourseProgress acknowledgement helpers', () => {
    describe('withAcknowledgementState', () => {
        const modules = [
            { _id: 'm1', moduleName: 'Security', tasks: [], totalTasks: 0, completedTasks: 0 },
            { _id: 'm2', moduleName: 'Privacy', tasks: [], totalTasks: 0, completedTasks: 0 }
        ] as any;

        it('marks modules without a record as not acknowledged', () => {
            const result = withAcknowledgementState(modules, []);

            expect(result[0].acknowledged).toBe(false);
            expect(result[0].acknowledgedAt).toBeNull();
            expect(result[1].acknowledged).toBe(false);
            expect(result[1].acknowledgedAt).toBeNull();
        });

        it('marks only the matching modules acknowledged with their saved timestamp', () => {
            const acknowledgedAt = new Date('2026-10-12T07:30:00.000Z');
            const result = withAcknowledgementState(modules, [
                { moduleId: 'm2', acknowledged: true, acknowledgedAt }
            ]);

            expect(result[0].acknowledged).toBe(false);
            expect(result[0].acknowledgedAt).toBeNull();
            expect(result[1].acknowledged).toBe(true);
            expect(result[1].acknowledgedAt).toEqual(acknowledgedAt);
        });

        it('preserves all existing module fields', () => {
            const result = withAcknowledgementState(modules, []);

            expect(result[0]).toEqual({
                ...modules[0],
                acknowledged: false,
                acknowledgedAt: null
            });
        });
    });

    describe('buildCourseModules', () => {
        it('includes the shared acknowledgementText in each module', () => {
            const modules = [
                { _id: 'm1', moduleName: 'Intro', moduleDescription: 'desc', acknowledgementText: 'I have read and understood.' }
            ] as any;
            const result = buildCourseModules(modules, new Map(), new Map());

            expect(result[0].acknowledgementText).toBe('I have read and understood.');
            expect(result[0].totalTasks).toBe(0);
            expect(result[0].completedTasks).toBe(0);
        });

        it('defaults missing acknowledgementText to an empty string', () => {
            const modules = [{ _id: 'm1', moduleName: 'Intro', moduleDescription: 'desc' }] as any;
            const result = buildCourseModules(modules, new Map(), new Map());

            expect(result[0].acknowledgementText).toBe('');
        });
    });
});