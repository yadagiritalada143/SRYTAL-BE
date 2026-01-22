import OrganizationThemesModel from '../../model/organizationThemesModel';

const getOrgThemes = async (organization_name: string): Promise<any> => {
    try {
        const result = await OrganizationThemesModel.findOne({ organization_name });
        return result;
    } catch (error: any) {
        console.error(`Error occured while fetching the themes: ${error}`);
        return error;
    }
}

export default { getOrgThemes }
