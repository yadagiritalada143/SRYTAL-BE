import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { IPDFGeneratorOptions, IPDFGenerationResult } from '../../interfaces/pdfGenerator';

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

    if (isVercel) {
        const executablePath = await chromium.executablePath();
        return puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1920, height: 1080 },
            executablePath,
            headless: true,
        });
    }

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
    try {
        const pdfOptions = { ...defaultPDFOptions, ...options };

        browser = await getBrowser();
        const page = await browser.newPage();
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
        });

        const pdfBuffer = await page.pdf({
            format: pdfOptions.format,
            landscape: pdfOptions.landscape,
            margin: pdfOptions.margin,
            displayHeaderFooter: pdfOptions.displayHeaderFooter,
            headerTemplate: pdfOptions.headerTemplate || '',
            footerTemplate: pdfOptions.footerTemplate || '',
            printBackground: pdfOptions.printBackground,
        });

        return {
            success: true,
            pdfBuffer: Buffer.from(pdfBuffer),
        };
    } catch (error: any) {
        console.error('Error generating PDF:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate PDF',
        };
    } finally {
        if (browser) {
            await browser.close();
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
