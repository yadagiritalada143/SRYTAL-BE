import { withAcknowledgementState, buildCourseModules } from '../../util/manageCourseProgress';

describe('manageCourseProgress acknowledgement helpers', () => {
    describe('withAcknowledgementState', () => {
        const modules = [
            {
                _id: 'm1',
                moduleName: 'Security',
                tasks: [
                    { _id: 'file1', taskName: 'Policy', type: 'FILE', isCompleted: false },
                    { _id: 'link1', taskName: 'Docs', type: 'LINK', isCompleted: false },
                    { _id: 'code1', taskName: 'Challenge', type: 'CODE', isCompleted: false }
                ]
            },
            {
                _id: 'm2',
                moduleName: 'Privacy',
                tasks: [{ _id: 'file2', taskName: 'Handbook', type: 'FILE', isCompleted: false }]
            }
        ] as any;

        it('marks FILE tasks without a record as not acknowledged and leaves others untouched', () => {
            const result = withAcknowledgementState(modules, []);
            const file1 = result[0].tasks.find((t: any) => t._id === 'file1')!;
            const link1 = result[0].tasks.find((t: any) => t._id === 'link1')!;
            const code1 = result[0].tasks.find((t: any) => t._id === 'code1')!;
            const file2 = result[1].tasks.find((t: any) => t._id === 'file2')!;

            expect(file1.acknowledged).toBe(false);
            expect(file1.acknowledgedAt).toBeNull();
            expect(link1).not.toHaveProperty('acknowledged');
            expect(code1).not.toHaveProperty('acknowledged');
            expect(file2.acknowledged).toBe(false);
        });

        it('marks only the matching FILE tasks acknowledged with their saved timestamp', () => {
            const acknowledgedAt = new Date('2026-10-12T07:30:00.000Z');
            const result = withAcknowledgementState(modules, [
                { taskId: 'file2', acknowledged: true, acknowledgedAt }
            ]);
            const file1 = result[0].tasks.find((t: any) => t._id === 'file1')!;
            const link1 = result[0].tasks.find((t: any) => t._id === 'link1')!;
            const file2 = result[1].tasks.find((t: any) => t._id === 'file2')!;

            expect(file1.acknowledged).toBe(false);
            expect(file1.acknowledgedAt).toBeNull();
            expect(link1).not.toHaveProperty('acknowledged');
            expect(file2.acknowledged).toBe(true);
            expect(file2.acknowledgedAt).toEqual(acknowledgedAt);
        });

        it('preserves all existing module and task fields', () => {
            const result = withAcknowledgementState(
                [{ _id: 'm1', moduleName: 'Security', tasks: [] }] as any,
                []
            );

            expect(result[0]).toEqual({
                _id: 'm1',
                moduleName: 'Security',
                tasks: []
            });
        });
    });

    describe('buildCourseModules', () => {
        it('includes the shared acknowledgementText on FILE tasks only', () => {
            const modules = [
                {
                    _id: 'm1',
                    moduleName: 'Intro',
                    moduleDescription: 'desc'
                }
            ] as any;
            const tasksByModule = new Map([
                ['m1', [
                    {
                        _id: 'f1',
                        taskName: 'Policy',
                        taskDescription: 'desc',
                        type: 'FILE',
                        acknowledgementText: 'I have read and understood.'
                    },
                    {
                        _id: 'l1',
                        taskName: 'Docs',
                        taskDescription: 'desc',
                        type: 'LINK',
                        acknowledgementText: 'Should not leak.'
                    }
                ]]
            ]);
            const result = buildCourseModules(modules, tasksByModule, new Map());
            const fileTask = result[0].tasks.find((t: any) => t._id === 'f1')!;
            const linkTask = result[0].tasks.find((t: any) => t._id === 'l1')!;

            expect(fileTask.acknowledgementText).toBe('I have read and understood.');
            expect(linkTask.acknowledgementText).toBeUndefined();
            expect(result[0]).not.toHaveProperty('acknowledgementText');
            expect(result[0].totalTasks).toBe(2);
            expect(result[0].completedTasks).toBe(0);
        });

        it('defaults missing acknowledgementText to an empty string on FILE tasks', () => {
            const modules = [{ _id: 'm1', moduleName: 'Intro', moduleDescription: 'desc' }] as any;
            const tasksByModule = new Map([
                ['m1', [
                    { _id: 'f1', taskName: 'Policy', taskDescription: 'desc', type: 'FILE' }
                ]]
            ]);
            const result = buildCourseModules(modules, tasksByModule, new Map());

            expect(result[0].tasks[0].acknowledgementText).toBe('');
        });
    });
});