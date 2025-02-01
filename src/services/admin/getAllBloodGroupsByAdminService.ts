import BloodgroupModel from '../../model/bloodGroupModel';

interface FetchBloodGroupDetailsResponse {
    success: boolean;
    bloodGroupList?: any;
}

const getAllBloodgroupsByAdmin = (): Promise<FetchBloodGroupDetailsResponse> => {
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
                console.error('Error in fetching Blood Group details:', error);
                reject({ success: false });
            });
    });
};

export default { getAllBloodgroupsByAdmin }

