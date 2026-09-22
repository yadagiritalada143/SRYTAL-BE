import ProgrammingLanguages from '../../model/programmingLanguagesModel';

const addProgrammingLanguage = async (languageName: string) => {
    try {
        const programmingLanguage = new ProgrammingLanguages({ languageName });
        const result = await programmingLanguage.save();
        return result;

    } catch (error: any) {
        console.error(`Error while adding programming language: ${error}`);
        throw new Error('An error occurred while adding programming language.');
    }
};

export default { addProgrammingLanguage };
