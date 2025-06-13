import express, { Express } from 'express';
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


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY!;

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

schedularService.updateNextMonthTimeSheet();

app.listen(port, () => {
    console.log(`Server is running at  http://localhost:${port}`);
});
