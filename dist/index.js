"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_1 = __importDefault(require("./config/swagger"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const databaseConfig_1 = __importDefault(require("./config/databaseConfig"));
const commonRoutes_1 = __importDefault(require("./routes/commonRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const superadminRoutes_1 = __importDefault(require("./routes/superadminRoutes"));
const recruiterRoutes_1 = __importDefault(require("./routes/recruiterRoutes"));
const timesheetcronjob_1 = __importDefault(require("./jobs/timesheetcronjob"));
const contentwriterRoutes_1 = __importDefault(require("./routes/contentwriterRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;
// Swagger setup
const swaggerDocs = (0, swagger_jsdoc_1.default)(swagger_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
}));
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)({
    exposedHeaders: ["*"]
}));
(0, databaseConfig_1.default)();
app.use('/', commonRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
app.use('/superadmin', superadminRoutes_1.default);
app.use('/recruiter', recruiterRoutes_1.default);
app.use('/contentwriter', contentwriterRoutes_1.default);
timesheetcronjob_1.default.updateNextMonthTimeSheet();
app.listen(port, () => {
    console.log(`Server is running at  http://localhost:${port}`);
});
