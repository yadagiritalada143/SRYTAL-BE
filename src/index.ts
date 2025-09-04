import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerOptions from './config/swagger';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import connectToDb from './config/databaseConfig';
import commonRouter from './routes/commonRoutes';
import adminRouter from './routes/adminRoutes';
import superadminRouter from './routes/superadminRoutes';
import recruiterRouter from './routes/recruiterRoutes';
import schedularService from './jobs/timesheetcronjob';
import contentwriterRouter from './routes/contentwriterRoutes';


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY!;

// Swagger setup
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(
    session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    }),
);
app.use(morgan('dev'));
app.use(cors({
    exposedHeaders: ["*"]
}));

connectToDb();

app.use('/', commonRouter);
app.use('/admin', adminRouter);
app.use('/superadmin', superadminRouter);
app.use('/recruiter', recruiterRouter);
app.use('/contentwriter', contentwriterRouter)

schedularService.updateNextMonthTimeSheet();

app.listen(port, () => {
    console.log(`Server is running at  http://localhost:${port}`);
});
