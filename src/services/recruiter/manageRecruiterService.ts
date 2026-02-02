import { IPoolcompanies } from "../../interfaces/poolcompanies";
import PoolCompaniesModel from "../../model/poolCompanies";

const getPoolCompanyDetails = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        PoolCompaniesModel
            .find()
            .then((poolCompaniesResponse: Array<IPoolcompanies>) => {
                if (!poolCompaniesResponse) {
                    reject({ success: false });
                }

                const responseToSendBack = poolCompaniesResponse.map((eachCompanyDetails) => {
                    return {
                        id: eachCompanyDetails._id,
                        companyName: eachCompanyDetails.companyName,
                        primaryContact: eachCompanyDetails.primaryContact,
                        secondaryContact_1: eachCompanyDetails.secondaryContact_1,
                        secondaryContact_2: eachCompanyDetails.secondaryContact_2,
                        status: eachCompanyDetails.status,
                        createdAt: eachCompanyDetails.createdAt,
                        lastUpdatedAt: eachCompanyDetails.lastUpdatedAt
                    }
                });
                resolve({ success: true, poolCompaniesResponse: responseToSendBack })
            })
            .catch((error: any) => {
                console.error(`Error in fetching pool companies list at service level: ${error}`)
                reject({ success: false });
            })
    })
}


const getPoolCompanyDetailsById = async (id: string) => {
    let poolCompanyDetails = await PoolCompaniesModel
        .findOne({ _id: id })
        .populate('comments.userId', 'firstName lastName');

    if (poolCompanyDetails && poolCompanyDetails.comments) {
        poolCompanyDetails.comments.sort((a, b) => b.updateAt - a.updateAt);
    }

    return poolCompanyDetails;
}

const addPoolCompany = async (companyDetailsToAdd: IPoolcompanies): Promise<any> => {
    companyDetailsToAdd.createdAt = new Date();
    companyDetailsToAdd.lastUpdatedAt = new Date();
    const poolCompanyDataToSave: any = new PoolCompaniesModel({ ...companyDetailsToAdd });

    const result = await poolCompanyDataToSave.save();
    return result;
}

export default { getPoolCompanyDetails, getPoolCompanyDetailsById, addPoolCompany };
