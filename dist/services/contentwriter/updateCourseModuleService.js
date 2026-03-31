"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coursemoduleModel_1 = __importDefault(require("../../model/coursemoduleModel"));
const updateCourseModule = async (id, moduleName, moduleDescription, thumbnail, status) => {
    try {
        const result = await coursemoduleModel_1.default.updateOne({ _id: id }, { moduleName, moduleDescription, thumbnail, status });
        if (!result) {
            return { success: false };
        }
        return { success: true, responseAfterModuleUpdate: result };
    }
    catch (error) {
        console.error(`Error in updating module: ${error}`);
        return { success: false, responseAfterModuleUpdate: error };
    }
};
exports.default = { updateCourseModule };
