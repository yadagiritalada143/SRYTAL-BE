export interface IPDFGeneratorOptions {
    format?: 'A4' | 'Letter' | 'Legal';
    landscape?: boolean;
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    headerTemplate?: string;
    footerTemplate?: string;
    displayHeaderFooter?: boolean;
    printBackground?: boolean;
}

export interface IPDFGenerationResult {
    success: boolean;
    pdfBuffer?: Buffer;
    fileName?: string;
    error?: string;
}
