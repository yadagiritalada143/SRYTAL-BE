import cron from 'node-cron';
import UserModel from '../model/userModel';

const start = () => {
    console.log('SchedulerService: Starting the scheduler...');

    cron.schedule('58 23 * * *', async () => {
        try {
            console.log('SchedulerService: Fetching user data...');

            const users = await UserModel.find({});

            const userList = users.map((user) => ({
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
            }));

            console.log('User List:', JSON.stringify(userList, null, 2));
        } catch (error: any) {
            console.error('SchedulerService: Error fetching user data:', error);
        }
    });
}

export default { start };