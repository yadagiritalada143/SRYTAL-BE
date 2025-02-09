import Employmenttype from '../../model/employmentTypeModel';


interface FetchEmploymentTypeResponse {
    success: boolean;
    employmenttypeList?: any;
}

const getAllEmploymentByAdmin = (): Promise<FetchEmploymentTypeResponse> => {
    return new Promise((resolve, reject) => {
        Employmenttype.find({})
            .then((employmenttypeList: any) => {
                if (!employmenttypeList) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        employmenttypeList: employmenttypeList
                    });
                }
            })
            .catch((error: any) => {
                console.error('Error in fetching Employmenttype:', error);
                reject({ success: false });
            });
    });
};

export default { getAllEmploymentByAdmin }

