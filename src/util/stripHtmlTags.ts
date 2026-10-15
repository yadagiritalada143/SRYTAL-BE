export const stripHtmlTags = (value?: string): string => {
    if (typeof value !== 'string') {
        return value as any;
    }

    return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#0*39;/gi, "'")
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

export default { stripHtmlTags };
