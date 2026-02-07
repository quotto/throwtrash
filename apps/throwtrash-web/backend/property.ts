const normalizeHost = (host: string): string => {
    if (host.startsWith("http://") || host.startsWith("https://")) {
        return host;
    }
    return `https://${host}`;
};

export default {
    SESSION_TABLE: "throwtrash-backend-session",
    SCHEDULE_TABLE: "TrashSchedule",
    AUTHORIZE_TABLE: "throwtrash-backend-authorization",
    TOKEN_TABLE: "throwtrash-backend-accesstoken",
    REFRESH_TABLE: "throwtrash-backend-refreshtoken",
    FRONTEND_URL: normalizeHost(process.env.FRONTEND_URL || "apps.mythrowaway.net"),
    AUTHORIZATION_URL: normalizeHost(process.env.AUTHORIZATION_ENDPOINT || "https://apps.mythrowaway.net"),
    SESSIONID_NAME:"throwaway-session",
    SESSION_MAX_AGE: 3600 // 60分 * 60秒
}
