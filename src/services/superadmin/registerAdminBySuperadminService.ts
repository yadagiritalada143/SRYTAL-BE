import UserModel from "../../model/userModel";
import { IUser } from "../../interfaces/user";

const isAccountPresent = async (email: string) => {
    const emailExists = await UserModel.findOne({ email: email }).then((user: any) => !!user);
    return emailExists;
}

const saveAccount = async (userData: IUser) => {
    const userDataToSave: any = new UserModel({ ...userData });

    const result = await userDataToSave.save();
    return result;
}

export default { isAccountPresent, saveAccount };
