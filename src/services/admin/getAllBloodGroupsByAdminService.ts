import BloodgroupModel from '../../model/bloodGroupModel';
import { IFetchBloodGroupDetailsResponse } from '../../interfaces/bloodgroup';

const getAllBloodgroupsByAdmin = (): Promise<IFetchBloodGroupDetailsResponse> => {
    return new Promise((resolve, reject) => {
        BloodgroupModel.find({})
            .then((bloodGroupsList: any) => {
                if (!bloodGroupsList) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        bloodGroupList: bloodGroupsList
                    });
                }
            })
            .catch((error: any) => {
                console.error(`Error in fetching Blood Group details: ${error}`);
                reject({ success: false });
            });
    });
};

export default { getAllBloodgroupsByAdmin }
