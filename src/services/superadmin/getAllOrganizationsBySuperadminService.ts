import Organization from "../../model/organization";

const getAllOrganizationsBySuperadmin = async () => {
    const organizations = await Organization.find({});
    return organizations;
};

export default { getAllOrganizationsBySuperadmin };
