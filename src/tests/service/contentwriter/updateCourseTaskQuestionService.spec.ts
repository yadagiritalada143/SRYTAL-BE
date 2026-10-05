import updateCourseTaskQuestionService from '../../../services/contentwriter/updateCourseTaskQuestionService';
import CourseTaskModel from '../../../model/courseTaskModel';
import TaskCodingQuestionModel from '../../../model/taskCodingQuestionModel';
import CourseModuleModel from '../../../model/coursemoduleModel';
import CourseModel from '../../../model/coursesModel';

jest.mock('../../../model/courseTaskModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/taskCodingQuestionModel', () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn()
    }
}));

jest.mock('../../../model/coursemoduleModel', () => ({
    __esModule: true,
    default: { findById: jest.fn() }
}));

jest.mock('../../../model/coursesModel', () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() }
}));

const taskFindByIdMock =
    (CourseTaskModel as unknown as { findById: jest.Mock }).findById;
const questionFindOneMock =
    (TaskCodingQuestionModel as unknown as { findOne: jest.Mock }).findOne;
const questionFindOneAndUpdateMock =
    (TaskCodingQuestionModel as unknown as { findOneAndUpdate: jest.Mock }).findOneAndUpdate;
const moduleFindByIdMock =
    (CourseModuleModel as unknown as { findById: jest.Mock }).findById;
const courseFindByIdAndUpdateMock =
    (CourseModel as unknown as { findByIdAndUpdate: jest.Mock }).findByIdAndUpdate;

describe('updateCourseTaskQuestionService', () => {
    beforeEach(() => {
        taskFindByIdMock.mockReset();
        questionFindOneMock.mockReset();
        questionFindOneAndUpdateMock.mockReset();
        moduleFindByIdMock.mockReset();
        courseFindByIdAndUpdateMock.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => {});

        taskFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue({
                _id: '64f123456789abcdef123456',
                moduleId: '64f123456789abcdef123111'
            })
        });
        questionFindOneMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: '64f123456789abcdef123999'
            })
        });
        questionFindOneAndUpdateMock.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                _id: '64f123456789abcdef123999'
            })
        });
        moduleFindByIdMock.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue({ courseId: '64f123456789abcdef123222' })
        });
        courseFindByIdAndUpdateMock.mockResolvedValue({});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('stores the public ARCHIVE status as INACTIVE', async () => {
        const result =
            await updateCourseTaskQuestionService.updateCourseTaskQuestion({
                taskId: '64f123456789abcdef123456',
                questionId: '64f123456789abcdef123999',
                status: 'ARCHIVE'
            });

        expect(questionFindOneAndUpdateMock).toHaveBeenCalledWith(
            {
                _id: '64f123456789abcdef123999',
                taskId: '64f123456789abcdef123456'
            },
            { $set: { status: 'INACTIVE' } },
            { new: true, runValidators: true }
        );
        expect(result.success).toBe(true);
    });
});
