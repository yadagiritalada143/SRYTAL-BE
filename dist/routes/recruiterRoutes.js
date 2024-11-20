"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const manageRecruiterController_1 = __importDefault(require("../controllers/recruiter/manageRecruiterController"));
const addCommentByRecruiterController_1 = __importDefault(require("../controllers/recruiter/addCommentByRecruiterController"));
const updateCompanyByRecruiterController_1 = __importDefault(require("../controllers/recruiter/updateCompanyByRecruiterController"));
const commonController_1 = __importDefault(require("../controllers/common/commonController"));
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const recruiterRouter = express_1.default.Router();
recruiterRouter.post('/login', commonController_1.default.login);
recruiterRouter.get('/getCompanyDetails', manageRecruiterController_1.default.getPoolCompanyDetails);
recruiterRouter.get('/getCompanyDetailsByIdByRecruiter/:id', manageRecruiterController_1.default.getPoolCompanyDetailsById);
recruiterRouter.post('/addCompanyByRecruiter', manageRecruiterController_1.default.addPoolCompany);
recruiterRouter.post('/addCommentByRecruiter', validateJWT_1.default, addCommentByRecruiterController_1.default.addCommentByRecruiter);
recruiterRouter.post('/updateCompanyByRecruiter', updateCompanyByRecruiterController_1.default.updateCompanyByRecruiter);
exports.default = recruiterRouter;
