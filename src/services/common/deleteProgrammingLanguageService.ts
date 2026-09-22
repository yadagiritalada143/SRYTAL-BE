import ProgrammingLanguages from '../../model/programmingLanguagesModel';

const deleteProgrammingLanguage = async (id: string): Promise<any> => {
    try {
        const result = await ProgrammingLanguages.findByIdAndDelete({ _id: id });
        return result;

    } catch (error: any) {
        console.error(`Error while deleting programming language: ${error}`);
        throw error;
    }
};

export default { deleteProgrammingLanguage };
