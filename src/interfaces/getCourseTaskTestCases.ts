import { ICodingTaskTestCase } from './codingTaskTestCase';

export interface IGetCourseTaskTestCasesResponse {
    codingTaskId: string;
    testCases: ICodingTaskTestCase[];
}
