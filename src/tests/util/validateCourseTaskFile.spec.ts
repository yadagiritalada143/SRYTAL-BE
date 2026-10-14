import { isAllowedCourseTaskFile } from '../../util/validateCourseTaskFile';

const buildFile = (originalname: string, mimetype: string) => ({ originalname, mimetype }) as Express.Multer.File;

describe('isAllowedCourseTaskFile', () => {
    it('accepts an allowed document', () => {
        expect(isAllowedCourseTaskFile(buildFile('notes.pdf', 'application/pdf'))).toBe(true);
    });

    it('accepts a generic MIME type when the extension is allowed', () => {
        expect(isAllowedCourseTaskFile(buildFile('notes.docx', 'application/octet-stream'))).toBe(true);
    });

    it('rejects .exe uploads', () => {
        expect(isAllowedCourseTaskFile(buildFile('malware.exe', 'application/pdf'))).toBe(false);
    });

    it('rejects other executable / script extensions', () => {
        expect(isAllowedCourseTaskFile(buildFile('run.bat', 'application/octet-stream'))).toBe(false);
        expect(isAllowedCourseTaskFile(buildFile('run.sh', 'text/plain'))).toBe(false);
        expect(isAllowedCourseTaskFile(buildFile('app.msi', 'application/octet-stream'))).toBe(false);
    });

    it('rejects files with disallowed or unknown extensions', () => {
        expect(isAllowedCourseTaskFile(buildFile('archive.zip', 'application/zip'))).toBe(false);
        expect(isAllowedCourseTaskFile(buildFile('noextension', 'application/pdf'))).toBe(false);
    });

    it('rejects a missing file', () => {
        expect(isAllowedCourseTaskFile(undefined)).toBe(false);
    });
});
