import axios from 'axios';
import { Types } from 'mongoose';
import CourseAssignment from '../../model/courseAssignmentModel';
import CourseModuleModel from '../../model/coursemoduleModel';
import CourseTaskModel from '../../model/courseTaskModel';
import ProgrammingLanguages from '../../model/programmingLanguagesModel';
import getUserOpenRouterKeyService from '../useropenrouter/getUserOpenRouterKeyService';

const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const generationPromises = new Map<string, Promise<string>>();

const getApiKey = async (userId: string): Promise<string> => {
    const keyRecord = await getUserOpenRouterKeyService.getUserOpenRouterKeyService(userId);
    const apiKey = keyRecord?.openrouterKey?.trim();

    if (!apiKey || /[\r\n]/.test(apiKey)) {
        throw new Error('OPENROUTER_API_KEY_INVALID_FORMAT');
    }

    return apiKey;
};

const requestOpenRouter = async (userId: string, prompt: string): Promise<string> => {
    if (!userId) {
        throw new Error('USER_AUTHENTICATION_REQUIRED');
    }

    const apiKey = await getApiKey(userId);
    let response;
    try {
        response = await axios.post(
            OPENROUTER_CHAT_COMPLETIONS_URL,
            {
                model: process.env.OPENROUTER_MODEL?.trim() || 'openrouter/auto',
                messages: [
                    {
                        role: 'system',
                        content: 'You generate accurate coding-task function specifications and starter code.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
    } catch (error: unknown) {
        if (
            axios.isAxiosError(error) &&
            (error.response?.status === 401 || error.response?.status === 403)
        ) {
            throw new Error('OPENROUTER_KEY_INVALID');
        }
        throw error;
    }

    const content = response.data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('OPENROUTER_EMPTY_RESPONSE');
    }

    return content.trim();
};

const extractCode = (content: string): string => {
    const fencedCode = content.match(/```[^\r\n]*\r?\n([\s\S]*?)```/);
    const candidate = (fencedCode?.[1] || content).trim();

    try {
        const parsed: unknown = JSON.parse(candidate);
        if (
            parsed &&
            typeof parsed === 'object' &&
            'code' in parsed &&
            typeof parsed.code === 'string'
        ) {
            return parsed.code.trim();
        }
    } catch {
        // A plain source-code response is also supported.
    }

    return candidate;
};

const generateBaseBoilerplate = async (taskDescription: string, userId: string): Promise<any> => {
    if (!taskDescription.trim()) {
        throw new Error('CODING_TASK_DESCRIPTION_REQUIRED');
    }

    const response = await requestOpenRouter( userId,
        [
            'Analyze the coding question below and produce a concise language-neutral pseudocode function skeleton.',
            'Include the function name, parameters, expected return value, and important constraints.',
            'Leave the function body unimplemented with a TODO marker. Do not provide a solution.',
            'Return only the skeleton.',
            '',
            `Task description: ${taskDescription.trim()}`,
            'Coding question:',
        ].join('\n')
    );

    const baseBoilerplate = extractCode(response);
    if (!baseBoilerplate || baseBoilerplate.length > 10000) {
        throw new Error('OPENROUTER_INVALID_BASE_BOILERPLATE');
    }

    return baseBoilerplate;
};

const generateLanguageBoilerplate = async (
    taskDescription: string,
    baseBoilerplate: string,
    languageName: string,
    userId: string
): Promise<string> => {
    if (!taskDescription.trim()) {
        throw new Error('CODING_TASK_DESCRIPTION_REQUIRED');
    }

    const response = await requestOpenRouter(
        userId,
        [
            `Create a starting function skeleton for this coding task in ${languageName}.`,
            'Use the function name, parameters, return value, and constraints in the supplied function contract.',
            'Include required declarations or imports only when they are needed for the skeleton.',
            'Leave the function body unimplemented with a clear TODO marker.',
            'Do not include sample input/output, tests, a main method, or explanatory text.',
            'Return source code only, optionally enclosed in one Markdown code fence.',
            '',
            'Coding question:',
            taskDescription.trim(),
            '',
            'Base function skeleton:',
            baseBoilerplate
        ].join('\n')
    );

    const code = extractCode(response);
    if (!code || code.length > 50000) {
        throw new Error('OPENROUTER_INVALID_LANGUAGE_BOILERPLATE');
    }

    return code;
};

const getOrGenerateCourseTaskBoilerplate = async (
    taskId: string,
    languageId: string,
    userId: string
): Promise<string> => {
    if (!Types.ObjectId.isValid(taskId) || !Types.ObjectId.isValid(languageId)) {
        throw new Error('INVALID_TASK_OR_LANGUAGE_ID');
    }
    if (!userId) {
        throw new Error('USER_AUTHENTICATION_REQUIRED');
    }

    const taskObjectId = new Types.ObjectId(taskId);
    const languageObjectId = new Types.ObjectId(languageId);
    const task: any = await CourseTaskModel.findById(taskObjectId).lean();

    if (!task) {
        throw new Error('COURSE_TASK_NOT_FOUND');
    }
    if (String(task.type || '').toUpperCase() !== 'CODE') {
        throw new Error('NOT_CODING_TASK');
    }
    if (!String(task.taskDescription || '').trim()) {
        throw new Error('CODING_TASK_DESCRIPTION_REQUIRED');
    }

    const [parentModule, language] = await Promise.all([
        CourseModuleModel.findById(task.moduleId).select('courseId').lean(),
        ProgrammingLanguages.findOne({ _id: languageObjectId, isActive: true })
            .select('languageName canonicalKey')
            .lean()
    ]);

    if (!language) {
        throw new Error('PROGRAMMING_LANGUAGE_NOT_FOUND');
    }
    if (!parentModule?.courseId) {
        throw new Error('TASK_NOT_ASSIGNED');
    }

    const assignment = await CourseAssignment.findOne({
        employeeId: userId,
        courseId: parentModule.courseId
    }).select('_id').lean();
    if (!assignment) {
        throw new Error('TASK_NOT_ASSIGNED');
    }

    const cachedCode = (task.starterCode || []).find(
        (entry: any) => String(entry.languageId) === String(languageObjectId)
    );
    if (cachedCode?.code) {
        return cachedCode.code;
    }

    const cacheKey = `${taskObjectId.toString()}:${languageObjectId.toString()}`;
    const pendingGeneration = generationPromises.get(cacheKey);
    if (pendingGeneration) {
        return pendingGeneration;
    }

    const generation = (async () => {
        let baseBoilerplate = String(task.baseBoilerplate || '').trim();
        if (!baseBoilerplate) {baseBoilerplate = await generateBaseBoilerplate((task.taskDescription || ''), userId);
            await CourseTaskModel.updateOne(
                { _id: taskObjectId, type: 'CODE' },
                { $set: { baseBoilerplate } }
            );
        }

        const code = await generateLanguageBoilerplate(
            String(task.taskDescription || ''),
            baseBoilerplate,
            String(language.languageName || language.canonicalKey),
            userId
        );

        const cacheUpdate = await CourseTaskModel.updateOne(
            {
                _id: taskObjectId,
                type: 'CODE',
                'starterCode.languageId': { $ne: languageObjectId }
            },
            {
                $push: {
                    starterCode: {
                        languageId: languageObjectId,
                        code,
                    }
                }
            }
        );

        if (cacheUpdate.matchedCount === 0) {
            const refreshedTask: any = await CourseTaskModel.findById(taskObjectId)
                .select('starterCode')
                .lean();
            const concurrentlyCachedCode = (refreshedTask?.starterCode || []).find(
                (entry: any) => String(entry.languageId) === String(languageObjectId)
            )?.code;

            if (concurrentlyCachedCode) {
                return concurrentlyCachedCode;
            }
            throw new Error('COURSE_TASK_NOT_FOUND');
        }

        return code;
    })();
    generationPromises.set(cacheKey, generation);

    try {
        return await generation;
    } finally {
        if (generationPromises.get(cacheKey) === generation) {
            generationPromises.delete(cacheKey);
        }
    }
};

export default { generateBaseBoilerplate, getOrGenerateCourseTaskBoilerplate};
 