import { extractSessionIdFromCookieHeader, getCookieHeader } from "../cookie";

describe("cookie utils", () => {
    it("Cookie ヘッダからセッションIDを抽出できる", () => {
        const cookie = "throwaway-session=QYCqU7tGxEu1otJdYUyV";
        expect(extractSessionIdFromCookieHeader(cookie)).toBe("QYCqU7tGxEu1otJdYUyV");
    });

    it("複数CookieからセッションIDを抽出できる", () => {
        const cookie = "foo=bar; throwaway-session=abc123; baz=qux";
        expect(extractSessionIdFromCookieHeader(cookie)).toBe("abc123");
    });

    it("Cookieが無い場合はnull", () => {
        expect(extractSessionIdFromCookieHeader(undefined)).toBeNull();
    });

    it("ヘッダの大小文字差を吸収できる", () => {
        const headers = { cookie: "throwaway-session=lower" };
        expect(getCookieHeader(headers, undefined)).toBe("throwaway-session=lower");
    });

    it("multiValueHeaders を優先する", () => {
        const headers = { Cookie: "throwaway-session=from-header" };
        const multi = { Cookie: ["throwaway-session=from-multi"] };
        expect(getCookieHeader(headers, multi)).toBe("throwaway-session=from-multi");
    });
});
