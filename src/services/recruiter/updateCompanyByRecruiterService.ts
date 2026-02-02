import PoolCompaniesModel from '../../model/poolCompanies';

const updatePoolCompanyDetails = async (detailsToUpdate: any) => {
    try {
        detailsToUpdate.lastUpdatedAt = new Date();
        const result = await PoolCompaniesModel.updateOne({ _id: detailsToUpdate.id }, detailsToUpdate);
        return { success: result.acknowledged };
    } catch (error: any) {
        console.error('Error occured while updating the pool company details:', error);
        return { success: false };
    }
}

export default { updatePoolCompanyDetails };