import ProgrammingLanguages from '../../model/programmingLanguagesModel';

const getProgrammingLanguageById = async (id: string) => {
    try {
        const programmingLanguage = await ProgrammingLanguages.findById({ _id: id });
        return programmingLanguage;

    } catch (error: any) {
        console.error(`Error while fetching programming language by id: ${error}`);
        throw error;
    }
};

export default { getProgrammingLanguageById };
