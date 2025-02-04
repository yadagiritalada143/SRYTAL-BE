

import BloodgroupModel from '../../model/bloodGroupModel'

interface deleteBloodGroupResponse {
    success: boolean;
}
const DeleteBloodGroupByAdmin = async (bloodGroupId: any):Promise<deleteBloodGroupResponse>=> {
    return new Promise(async (resolve, reject) => {
        const result = await BloodgroupModel.findByIdAndDelete(
            { _id: bloodGroupId })
            .then((responseBloodGroupDelete: any) => {
                resolve({ success: true });
            })
            .catch((error: any) => {
                console.error('Error in  deleting blood group: ', error);
                reject({ success: false });
            });
    });  
}

export default { DeleteBloodGroupByAdmin };

