export const apiBase = (() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    if (!apiBase) return '';
    if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
        return apiBase;
    }
    return `https://${apiBase}`;
})();
