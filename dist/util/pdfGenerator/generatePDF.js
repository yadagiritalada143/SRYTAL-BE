"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectDataIntoTemplate = exports.generatePDFWithHeaderFooter = exports.generatePDFFromHTML = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const chromium_1 = __importDefault(require("@sparticuz/chromium"));
console.warn('[PDFGenerator] Module loaded');
const defaultPDFOptions = {
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
        const executablePath = await chromium_1.default.executablePath();
        console.warn('[PDFGenerator] Chromium executable path:', executablePath);
        console.warn('[PDFGenerator] Launching puppeteer with chromium args...');
        return puppeteer_core_1.default.launch({
            args: chromium_1.default.args,
            defaultViewport: { width: 1920, height: 1080 },
            executablePath,
            headless: true,
        });
    }
    console.warn('[PDFGenerator] Using local Chrome for development...');
    // Local development - use installed Chrome
    return puppeteer_core_1.default.launch({
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
const generatePDFFromHTML = async (htmlContent, options = {}) => {
    let browser;
    console.warn('[PDFGenerator] generatePDFFromHTML called');
    console.warn('[PDFGenerator] HTML content length:', htmlContent ? htmlContent.length : 0);
    console.warn('[PDFGenerator] PDF Options:', JSON.stringify(options));
    try {
        const pdfOptions = Object.assign(Object.assign({}, defaultPDFOptions), options);
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
    }
    catch (error) {
        console.error('[PDFGenerator] PDF Generation FAILED!');
        console.error('[PDFGenerator] Error Name:', error.name);
        console.error('[PDFGenerator] Error Message:', error.message);
        console.error('[PDFGenerator] Error Stack:', error.stack);
        return {
            success: false,
            error: error.message || 'Failed to generate PDF',
        };
    }
    finally {
        if (browser) {
            console.warn('[PDFGenerator] Closing browser...');
            await browser.close();
            console.warn('[PDFGenerator] Browser closed');
        }
    }
};
exports.generatePDFFromHTML = generatePDFFromHTML;
const generatePDFWithHeaderFooter = async (htmlContent, headerTemplate, footerTemplate, options = {}) => {
    var _a, _b, _c, _d;
    const optionsWithHeaderFooter = Object.assign(Object.assign({}, options), { displayHeaderFooter: true, headerTemplate,
        footerTemplate, margin: {
            top: ((_a = options.margin) === null || _a === void 0 ? void 0 : _a.top) || '80px',
            right: ((_b = options.margin) === null || _b === void 0 ? void 0 : _b.right) || '20px',
            bottom: ((_c = options.margin) === null || _c === void 0 ? void 0 : _c.bottom) || '60px',
            left: ((_d = options.margin) === null || _d === void 0 ? void 0 : _d.left) || '20px',
        } });
    return (0, exports.generatePDFFromHTML)(htmlContent, optionsWithHeaderFooter);
};
exports.generatePDFWithHeaderFooter = generatePDFWithHeaderFooter;
const injectDataIntoTemplate = (template, data) => {
    let result = template;
    const replacePlaceholders = (obj, prefix = '') => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const placeholderKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    replacePlaceholders(value, placeholderKey);
                }
                else {
                    const placeholder = new RegExp(`{{\\s*${placeholderKey}\\s*}}`, 'g');
                    result = result.replace(placeholder, String(value !== null && value !== void 0 ? value : ''));
                }
            }
        }
    };
    replacePlaceholders(data);
    return result;
};
exports.injectDataIntoTemplate = injectDataIntoTemplate;
exports.default = { generatePDFFromHTML: exports.generatePDFFromHTML, generatePDFWithHeaderFooter: exports.generatePDFWithHeaderFooter, injectDataIntoTemplate: exports.injectDataIntoTemplate };
