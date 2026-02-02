import BloodgroupModel from '../../model/bloodGroupModel';

const addBloodgroupByAdmin = async (addBloodgroup: string) => {
    try {
        const bloodgroupDataToSave: any = new BloodgroupModel({ type: addBloodgroup });
        const result = await bloodgroupDataToSave.save();
        return result;
    } catch (error: any) {
        console.error(`Error in adding Blood Group details: ${error}`);
        return { success: false };
    }
};

export default { addBloodgroupByAdmin }

