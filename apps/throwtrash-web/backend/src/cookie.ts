import property from "./property.js"

export const getCookieHeader = (
    headers?: Record<string, string | undefined>,
    multiValueHeaders?: Record<string, string[] | undefined>
): string | undefined => {
    const multi = multiValueHeaders?.Cookie?.[0] ?? multiValueHeaders?.cookie?.[0];
    if (multi) {
        return multi;
    }
    return headers?.Cookie ?? headers?.cookie;
};

export const extractSessionIdFromCookieHeader = (cookieHeader: string | undefined): string | null => {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(";");
    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        const [name, ...rest] = trimmed.split("=");
        if (name === property.SESSIONID_NAME) {
            return rest.join("=") || null;
        }
    }
    return null;
};
