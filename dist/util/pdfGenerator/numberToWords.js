"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIndianCurrency = exports.convertAmountToWords = exports.convertNumberToWords = void 0;
const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
];
const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];
const convertTwoDigit = (num) => {
    if (num < 20) {
        return ones[num];
    }
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? ' ' + ones[one] : '');
};
const convertThreeDigit = (num) => {
    if (num < 100) {
        return convertTwoDigit(num);
    }
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return ones[hundred] + ' Hundred' + (remainder ? ' ' + convertTwoDigit(remainder) : '');
};
const convertNumberToWords = (amount) => {
    if (amount === 0)
        return 'Zero';
    if (amount < 0)
        return 'Minus ' + (0, exports.convertNumberToWords)(Math.abs(amount));
    amount = Math.round(amount);
    let words = '';
    if (amount >= 10000000) {
        words += convertTwoDigit(Math.floor(amount / 10000000)) + ' Crore ';
        amount %= 10000000;
    }
    if (amount >= 100000) {
        words += convertTwoDigit(Math.floor(amount / 100000)) + ' Lakh ';
        amount %= 100000;
    }
    if (amount >= 1000) {
        words += convertTwoDigit(Math.floor(amount / 1000)) + ' Thousand ';
        amount %= 1000;
    }
    if (amount > 0) {
        words += convertThreeDigit(amount);
    }
    return words.trim();
};
exports.convertNumberToWords = convertNumberToWords;
const convertAmountToWords = (amount) => {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    let words = 'Rupees ' + (0, exports.convertNumberToWords)(rupees);
    if (paise > 0) {
        words += ' and ' + (0, exports.convertNumberToWords)(paise) + ' Paise';
    }
    words += ' Only';
    return words;
};
exports.convertAmountToWords = convertAmountToWords;
const formatIndianCurrency = (amount) => {
    const [integerPart, decimalPart] = amount.toFixed(2).split('.');
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    let formattedInteger = lastThree;
    if (remaining) {
        formattedInteger = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }
    return formattedInteger + '.' + decimalPart;
};
exports.formatIndianCurrency = formatIndianCurrency;
exports.default = { convertNumberToWords: exports.convertNumberToWords, convertAmountToWords: exports.convertAmountToWords, formatIndianCurrency: exports.formatIndianCurrency };
