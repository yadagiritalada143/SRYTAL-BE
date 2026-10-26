import CourseTaskModel from '../../model/courseTaskModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { IReorderCourseTaskItem, IReorderCourseTasksResponse } from '../../interfaces/courseTask';

const isValidObjectId = (value: string): boolean => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

const reorderCourseTasks = async (
    moduleId: string,
    tasks: IReorderCourseTaskItem[]
): Promise<IReorderCourseTasksResponse> => {
    try {
        if (!isValidObjectId(moduleId)) {
            return { success: false, errorCode: 'INVALID_MODULE_ID' };
        }

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return { success: false, errorCode: 'INVALID_TASKS' };
        }

        const taskIds = tasks.map((task) => String(task?.taskId || ''));

        if (taskIds.some((taskId) => !isValidObjectId(taskId))) {
            return { success: false, errorCode: 'INVALID_TASK_ID' };
        }

        if (new Set(taskIds).size !== taskIds.length) {
            return { success: false, errorCode: 'DUPLICATE_TASK_ID' };
        }

        const orderIdxs = tasks.map((task) => task?.orderIdx);

        if (orderIdxs.some((orderIdx) => !Number.isInteger(orderIdx) || orderIdx < 1)) {
            return { success: false, errorCode: 'INVALID_ORDER_IDX' };
        }

        if (new Set(orderIdxs).size !== orderIdxs.length) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }

        const courseModule: any = await CourseModuleModel.findById(moduleId)
            .select('_id courseId')
            .lean();

        if (!courseModule) {
            return { success: false, errorCode: 'MODULE_NOT_FOUND' };
        }

        const courseTasks: any[] = await CourseTaskModel.find({
            _id: { $in: taskIds }
        })
            .select('_id moduleId')
            .lean();

        if (courseTasks.length !== taskIds.length) {
            return { success: false, errorCode: 'TASK_NOT_FOUND' };
        }

        const tasksBelongToModule = courseTasks.every(
            (courseTask) => String(courseTask.moduleId) === String(moduleId)
        );

        if (!tasksBelongToModule) {
            return { success: false, errorCode: 'TASK_NOT_IN_MODULE' };
        }

        const conflictingTask = await CourseTaskModel.findOne({
            moduleId,
            orderIdx: { $in: orderIdxs },
            _id: { $nin: taskIds }
        })
            .select('_id')
            .lean();

        if (conflictingTask) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }

        await CourseTaskModel.bulkWrite(
            tasks.map((task) => ({
                updateOne: {
                    filter: { _id: task.taskId, moduleId },
                    update: { $set: { orderIdx: task.orderIdx } }
                }
            }))
        );

        if (courseModule.courseId) {
            await CourseModel.findByIdAndUpdate(courseModule.courseId, {
                $currentDate: { updatedAt: true }
            });
        }

        const updatedTasks = await CourseTaskModel.find({
            _id: { $in: taskIds },
            moduleId
        })
            .select('_id orderIdx')
            .lean();

        const orderedTasks = tasks.map((task) => {
            const updatedTask = updatedTasks.find(
                (item: any) => String(item._id) === String(task.taskId)
            );
            const orderIdx = updatedTask ? Number(updatedTask.orderIdx) : Number(task.orderIdx);
            return {
                taskId: task.taskId,
                orderIdx
            };
        });

        return {
            success: true,
            data: {
                moduleId,
                tasks: orderedTasks
            }
        };
    } catch (error: any) {
        console.error(`Error in reordering course tasks: ${error}`);
        return { success: false, errorCode: 'REORDER_FAILED' };
    }
};

export default { reorderCourseTasks };
