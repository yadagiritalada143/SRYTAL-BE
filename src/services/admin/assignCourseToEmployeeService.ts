
import CourseAssignment from '../../model/courseAssignmentModel';
import TaskProgressModel from '../../model/taskProgressModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import {COURSE_ASSIGNMENT_ERRORS_MESSAGES} from '../../constants/admin/courseAssignmentMessages';

const assignCourseToEmployee = async ( courseId: string, employeeId: string, assignedByAdminId: string, dueDate: Date ): Promise<any> => {
    try {

        const existingAssignment = await CourseAssignment.findOne({ courseId, employeeId, });

        if (existingAssignment) {
            throw new Error( COURSE_ASSIGNMENT_ERRORS_MESSAGES.COURSE_ASSIGNMENT_ALREADY_ASSIGNED_MESSAGE);
        }

         const modules = await CourseModuleModel.find({ courseId });

        const moduleIds = modules.map(
            (module) => module._id
        );

        const tasks =  moduleIds.length > 0  ? await CourseTaskModel.find({ moduleId: { $in: moduleIds } }) : [];

        const assignment = await CourseAssignment.create({ courseId, employeeId, assignedByAdminId, status: 'Assigned', assignedAt: new Date(),  dueDate, completedAt: null });

        if (tasks.length > 0) {

            const taskProgressRecords =
                tasks.map((task) => ({
                    courseAssignmentId:
                        assignment._id,

                    moduleId:
                        task.moduleId,

                    taskId:
                        task._id,

                    isCompleted: false,

                    completedAt: null,
                }));

            await TaskProgressModel.insertMany( taskProgressRecords );
        }

        return {
            courseAssignmentId: assignment._id,
            courseId: assignment.courseId,
            employeeId: assignment.employeeId,
            status: assignment.status,
            dueDate: assignment.dueDate,
            assignedAt: assignment.assignedAt,
            taskProgressCreated: tasks.length,
        };

    } catch (error: any) {
        console.error( `Error in assigning course: ${error.message}` );
        throw error;
    }
};

export default { assignCourseToEmployee };
