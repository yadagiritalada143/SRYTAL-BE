import CourseModuleModel from '../../model/coursemoduleModel';
import CourseModel from '../../model/coursesModel';
import { IReorderCourseModuleItem, IReorderCourseModulesResponse } from '../../interfaces/coursemodule';

const reorderCourseModules = async (courseId: string, modules: IReorderCourseModuleItem[]): Promise<IReorderCourseModulesResponse> => {
    try {
        if (!courseId) {
            return { success: false, errorCode: 'INVALID_COURSE_ID' };
        }

        if (!Array.isArray(modules) || modules.length === 0) {
            return { success: false, errorCode: 'INVALID_MODULES' };
        }

        const moduleIds = modules.map((module) => String(module?.moduleId || ''));

        if (moduleIds.some((moduleId) => !moduleId)) {
            return { success: false, errorCode: 'INVALID_MODULE_ID' };
        }

        if (new Set(moduleIds).size !== moduleIds.length) {
            return { success: false, errorCode: 'DUPLICATE_MODULE_ID' };
        }

        const orderIdxs = modules.map((module) => module?.orderIdx);

        if (orderIdxs.some((orderIdx) => !Number.isInteger(orderIdx) || orderIdx < 1)) {
            return { success: false, errorCode: 'INVALID_ORDER_IDX' };
        }

        if (new Set(orderIdxs).size !== orderIdxs.length) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }

        const course = await CourseModel.findById(courseId).select('_id').lean();

        if (!course) {
            return { success: false, errorCode: 'COURSE_NOT_FOUND' };
        }

        const courseModules: any[] = await CourseModuleModel.find({
            _id: { $in: moduleIds }
        })
            .select('_id courseId')
            .lean();

        if (courseModules.length !== moduleIds.length) {
            return { success: false, errorCode: 'MODULE_NOT_FOUND' };
        }

        const modulesBelongToCourse = courseModules.every(
            (courseModule) => String(courseModule.courseId) === String(courseId)
        );

        if (!modulesBelongToCourse) {
            return { success: false, errorCode: 'MODULE_NOT_IN_COURSE' };
        }

        const conflictingModule = await CourseModuleModel.findOne({
            courseId,
            orderIdx: { $in: orderIdxs },
            _id: { $nin: moduleIds }
        })
            .select('_id')
            .lean();

        if (conflictingModule) {
            return { success: false, errorCode: 'DUPLICATE_ORDER_IDX' };
        }

        await CourseModuleModel.bulkWrite(
            modules.map((module) => ({
                updateOne: {
                    filter: { _id: module.moduleId, courseId },
                    update: { $set: { orderIdx: module.orderIdx } }
                }
            }))
        );

        await CourseModel.findByIdAndUpdate(courseId, { $currentDate: { updatedAt: true } });

        const updatedModules = await CourseModuleModel.find({
            _id: { $in: moduleIds },
            courseId
        })
            .select('_id moduleId orderIdx')
            .lean();

        const reorderedModules = modules.map((module) => ({
                moduleId: module.moduleId,
                orderIdx: module.orderIdx
        }));

        return {
            success: true,
            data: {
                courseId,
                modules: reorderedModules
            }
        };
    } catch (error: any) {
        console.error(`Error in reordering course modules: ${error}`);
        return { success: false, errorCode: 'REORDER_FAILED' };
    }
};

export default { reorderCourseModules };
