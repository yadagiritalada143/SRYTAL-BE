import Employmenttype from '../../model/employmentTypeModel';

interface FetchEmploymentTypeResponse {
    success: boolean;
    employmentTypesList?: any;
}

const getAllEmploymentTypesByAdmin = (): Promise<FetchEmploymentTypeResponse> => {
    return new Promise((resolve, reject) => {
        Employmenttype.find({})
            .then((employmentTypesList: any) => {
                if (!employmentTypesList) {
                    reject({ success: false });
                } else {
                    resolve({
                        success: true,
                        employmentTypesList: employmentTypesList
                    });
                }
            })
            .catch((error: any) => {
                console.error(`Error in fetching Employmenttype:${error}`);
                reject({ success: false });
            });
    });
};

export default { getAllEmploymentTypesByAdmin }
