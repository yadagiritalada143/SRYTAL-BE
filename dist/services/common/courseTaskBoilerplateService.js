"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = require("mongoose");
const courseAssignmentModel_1 = __importDefault(require("../../model/courseAssignmentModel"));
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const courseTaskModel_1 = __importDefault(require("../../model/courseTaskModel"));
const programmingLanguagesModel_1 = __importDefault(require("../../model/programmingLanguagesModel"));
const getUserOpenRouterKeyService_1 = __importDefault(require("../useropenrouter/getUserOpenRouterKeyService"));
const OPENROUTER_CHAT_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';
const generationPromises = new Map();
/**
 * Version stamped on every cached starter-code entry. Lets the platform tell
 * apart skeletons produced by the current generation contract from ones written
 * by an earlier prompt/shape, so stale caches can be migrated without guessing.
 */
const BOILERPLATE_VERSION = 1;
const getApiKey = async (userId) => {
    var _a;
    const keyRecord = await getUserOpenRouterKeyService_1.default.getUserOpenRouterKeyService(userId);
    const apiKey = (_a = keyRecord === null || keyRecord === void 0 ? void 0 : keyRecord.openrouterKey) === null || _a === void 0 ? void 0 : _a.trim();
    if (!apiKey || /[\r\n]/.test(apiKey)) {
        throw new Error('OPENROUTER_API_KEY_INVALID_FORMAT');
    }
    return apiKey;
};
const requestOpenRouter = async (userId, prompt) => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!userId) {
        throw new Error('USER_AUTHENTICATION_REQUIRED');
    }
    const apiKey = await getApiKey(userId);
    let response;
    try {
        response = await axios_1.default.post(OPENROUTER_CHAT_COMPLETIONS_URL, {
            model: ((_a = process.env.OPENROUTER_MODEL) === null || _a === void 0 ? void 0 : _a.trim()) || 'openrouter/auto',
            messages: [
                {
                    role: 'system',
                    content: 'You generate accurate coding-task function specifications and starter code.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.2
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) &&
            (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 401 || ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 403)) {
            throw new Error('OPENROUTER_KEY_INVALID');
        }
        throw error;
    }
    const content = (_g = (_f = (_e = (_d = response.data) === null || _d === void 0 ? void 0 : _d.choices) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.message) === null || _g === void 0 ? void 0 : _g.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('OPENROUTER_EMPTY_RESPONSE');
    }
    return content.trim();
};
const extractCode = (content) => {
    const fencedCode = content.match(/```[^\r\n]*\r?\n([\s\S]*?)```/);
    const candidate = ((fencedCode === null || fencedCode === void 0 ? void 0 : fencedCode[1]) || content).trim();
    try {
        const parsed = JSON.parse(candidate);
        if (parsed &&
            typeof parsed === 'object' &&
            'code' in parsed &&
            typeof parsed.code === 'string') {
            return parsed.code.trim();
        }
    }
    catch (_a) {
        // A plain source-code response is also supported.
    }
    return candidate;
};
const generateBaseBoilerplate = async (taskDescription, userId) => {
    if (!taskDescription.trim()) {
        throw new Error('CODING_TASK_DESCRIPTION_REQUIRED');
    }
    const response = await requestOpenRouter(userId, [
        'Analyze the coding question below and produce a concise language-neutral pseudocode function skeleton.',
        'Include the function name, parameters, expected return value, and important constraints.',
        'Leave the function body unimplemented with a TODO marker. Do not provide a solution.',
        'Return only the skeleton.',
        '',
        `Task description: ${taskDescription.trim()}`,
        'Coding question:',
    ].join('\n'));
    const baseBoilerplate = extractCode(response);
    if (!baseBoilerplate || baseBoilerplate.length > 10000) {
        throw new Error('OPENROUTER_INVALID_BASE_BOILERPLATE');
    }
    return baseBoilerplate;
};
const generateLanguageBoilerplate = async (taskDescription, baseBoilerplate, languageName, userId) => {
    if (!taskDescription.trim()) {
        throw new Error('CODING_TASK_DESCRIPTION_REQUIRED');
    }
    const response = await requestOpenRouter(userId, [
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
    ].join('\n'));
    const code = extractCode(response);
    if (!code || code.length > 50000) {
        throw new Error('OPENROUTER_INVALID_LANGUAGE_BOILERPLATE');
    }
    return code;
};
const getOrGenerateCourseTaskBoilerplate = async (taskId, languageId, userId) => {
    if (!mongoose_1.Types.ObjectId.isValid(taskId) || !mongoose_1.Types.ObjectId.isValid(languageId)) {
        throw new Error('INVALID_TASK_OR_LANGUAGE_ID');
    }
    if (!userId) {
        throw new Error('USER_AUTHENTICATION_REQUIRED');
    }
    const taskObjectId = new mongoose_1.Types.ObjectId(taskId);
    const languageObjectId = new mongoose_1.Types.ObjectId(languageId);
    const task = await courseTaskModel_1.default.findById(taskObjectId).lean();
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
        coursemoduleModel_1.default.findById(task.moduleId).select('courseId').lean(),
        programmingLanguagesModel_1.default.findOne({ _id: languageObjectId, isActive: true })
            .select('languageName canonicalKey')
            .lean()
    ]);
    if (!language) {
        throw new Error('PROGRAMMING_LANGUAGE_NOT_FOUND');
    }
    if (!(parentModule === null || parentModule === void 0 ? void 0 : parentModule.courseId)) {
        throw new Error('TASK_NOT_ASSIGNED');
    }
    const assignment = await courseAssignmentModel_1.default.findOne({
        employeeId: userId,
        courseId: parentModule.courseId
    }).select('_id').lean();
    if (!assignment) {
        throw new Error('TASK_NOT_ASSIGNED');
    }
    const cachedCode = (task.starterCode || []).find((entry) => String(entry.languageId) === String(languageObjectId));
    if (cachedCode === null || cachedCode === void 0 ? void 0 : cachedCode.code) {
        return cachedCode.code;
    }
    const cacheKey = `${taskObjectId.toString()}:${languageObjectId.toString()}`;
    const pendingGeneration = generationPromises.get(cacheKey);
    if (pendingGeneration) {
        return pendingGeneration;
    }
    const generation = (async () => {
        var _a;
        let baseBoilerplate = String(task.baseBoilerplate || '').trim();
        if (!baseBoilerplate) {
            baseBoilerplate = await generateBaseBoilerplate((task.taskDescription || ''), userId);
            await courseTaskModel_1.default.updateOne({ _id: taskObjectId, type: 'CODE' }, { $set: { baseBoilerplate } });
        }
        const code = await generateLanguageBoilerplate(String(task.taskDescription || ''), baseBoilerplate, String(language.languageName || language.canonicalKey), userId);
        const cacheUpdate = await courseTaskModel_1.default.updateOne({
            _id: taskObjectId,
            type: 'CODE',
            'starterCode.languageId': { $ne: languageObjectId }
        }, {
            $push: {
                starterCode: {
                    languageId: languageObjectId,
                    code,
                    boilerplateVersion: BOILERPLATE_VERSION
                }
            }
        });
        if (cacheUpdate.matchedCount === 0) {
            const refreshedTask = await courseTaskModel_1.default.findById(taskObjectId)
                .select('starterCode')
                .lean();
            const concurrentlyCachedCode = (_a = ((refreshedTask === null || refreshedTask === void 0 ? void 0 : refreshedTask.starterCode) || []).find((entry) => String(entry.languageId) === String(languageObjectId))) === null || _a === void 0 ? void 0 : _a.code;
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
    }
    finally {
        if (generationPromises.get(cacheKey) === generation) {
            generationPromises.delete(cacheKey);
        }
    }
};
exports.default = { generateBaseBoilerplate, getOrGenerateCourseTaskBoilerplate };
