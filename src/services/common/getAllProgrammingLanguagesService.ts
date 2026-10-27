import ProgrammingLanguages from '../../model/programmingLanguagesModel';

const getAllProgrammingLanguages = async () => {
    try {
        const programmingLanguages = await ProgrammingLanguages.find({});
        return programmingLanguages;

    } catch (error: any) {
        console.error(`Error while fetching programming languages: ${error}`);
        throw error;
    }
};

export default { getAllProgrammingLanguages };
