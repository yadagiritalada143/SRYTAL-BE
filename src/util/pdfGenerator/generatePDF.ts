import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { IPDFGeneratorOptions, IPDFGenerationResult } from '../../interfaces/pdfGenerator';

console.warn('[PDFGenerator] Module loaded');

const defaultPDFOptions: IPDFGeneratorOptions = {
    format: 'A4',
    landscape: false,
    margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
    },
    displayHeaderFooter: false,
    printBackground: true,
};

const getBrowser = async () => {
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
    console.warn('[PDFGenerator] getBrowser called');
    console.warn('[PDFGenerator] Environment Check - VERCEL:', process.env.VERCEL || 'NOT SET');
    console.warn('[PDFGenerator] Environment Check - AWS_LAMBDA_FUNCTION_NAME:', process.env.AWS_LAMBDA_FUNCTION_NAME || 'NOT SET');
    console.warn('[PDFGenerator] Using Vercel/Lambda mode:', !!isVercel);

    if (isVercel) {
        console.warn('[PDFGenerator] Getting chromium executable path for Vercel...');
        const executablePath = await chromium.executablePath();
        console.warn('[PDFGenerator] Chromium executable path:', executablePath);
        console.warn('[PDFGenerator] Launching puppeteer with chromium args...');
        return puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1920, height: 1080 },
            executablePath,
            headless: true,
        });
    }

    console.warn('[PDFGenerator] Using local Chrome for development...');
    // Local development - use installed Chrome
    return puppeteer.launch({
        headless: true,
        executablePath: process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'darwin'
                ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
                : '/usr/bin/google-chrome',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    });
};

export const generatePDFFromHTML = async (
    htmlContent: string,
    options: IPDFGeneratorOptions = {}
): Promise<IPDFGenerationResult> => {
    let browser;
    console.warn('[PDFGenerator] generatePDFFromHTML called');
    console.warn('[PDFGenerator] HTML content length:', htmlContent ? htmlContent.length : 0);
    console.warn('[PDFGenerator] PDF Options:', JSON.stringify(options));

    try {
        const pdfOptions = { ...defaultPDFOptions, ...options };
        console.warn('[PDFGenerator] Merged PDF Options:', JSON.stringify(pdfOptions));

        console.warn('[PDFGenerator] Getting browser...');
        browser = await getBrowser();
        console.warn('[PDFGenerator] Browser launched successfully');

        console.warn('[PDFGenerator] Creating new page...');
        const page = await browser.newPage();
        console.warn('[PDFGenerator] Page created, setting content...');

        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
        });
        console.warn('[PDFGenerator] Content set, waiting for fonts...');

        // Wait for fonts to load
        await page.evaluateHandle('document.fonts.ready');
        console.warn('[PDFGenerator] Fonts loaded, generating PDF...');

        const pdfBuffer = await page.pdf({
            format: pdfOptions.format,
            landscape: pdfOptions.landscape,
            margin: pdfOptions.margin,
            displayHeaderFooter: pdfOptions.displayHeaderFooter,
            headerTemplate: pdfOptions.headerTemplate || '',
            footerTemplate: pdfOptions.footerTemplate || '',
            printBackground: pdfOptions.printBackground,
        });

        console.warn('[PDFGenerator] PDF generated successfully!');
        console.warn('[PDFGenerator] PDF buffer size:', pdfBuffer.length, 'bytes');

        return {
            success: true,
            pdfBuffer: Buffer.from(pdfBuffer),
        };
    } catch (error: any) {
        console.error('[PDFGenerator] PDF Generation FAILED!');
        console.error('[PDFGenerator] Error Name:', error.name);
        console.error('[PDFGenerator] Error Message:', error.message);
        console.error('[PDFGenerator] Error Stack:', error.stack);
        return {
            success: false,
            error: error.message || 'Failed to generate PDF',
        };
    } finally {
        if (browser) {
            console.warn('[PDFGenerator] Closing browser...');
            await browser.close();
            console.warn('[PDFGenerator] Browser closed');
        }
    }
};

export const generatePDFWithHeaderFooter = async (
    htmlContent: string,
    headerTemplate: string,
    footerTemplate: string,
    options: IPDFGeneratorOptions = {}
): Promise<IPDFGenerationResult> => {
    const optionsWithHeaderFooter: IPDFGeneratorOptions = {
        ...options,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate,
        margin: {
            top: options.margin?.top || '80px',
            right: options.margin?.right || '20px',
            bottom: options.margin?.bottom || '60px',
            left: options.margin?.left || '20px',
        },
    };

    return generatePDFFromHTML(htmlContent, optionsWithHeaderFooter);
};

export const injectDataIntoTemplate = (
    template: string,
    data: Record<string, any>
): string => {
    let result = template;
    const replacePlaceholders = (obj: Record<string, any>, prefix: string = '') => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const placeholderKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    replacePlaceholders(value, placeholderKey);
                } else {
                    const placeholder = new RegExp(`{{\\s*${placeholderKey}\\s*}}`, 'g');
                    result = result.replace(placeholder, String(value ?? ''));
                }
            }
        }
    };

    replacePlaceholders(data);
    return result;
};

export default { generatePDFFromHTML, generatePDFWithHeaderFooter, injectDataIntoTemplate };
