import { jest } from "@jest/globals";
import type { SessionItem } from "../interface";

process.env.FRONTEND_URL = "https://apps.mythrowaway.net/v5";

const mockResult: { [key: string]: SessionItem } = {};

const mockDb = {
  saveSession: jest.fn(),
};

jest.unstable_mockModule("../dbadapter", () => ({
  default: mockDb,
}));

const common = await import("trash-common");
const logger = common.getLogger();
logger.setLevel_DEBUG();

const { default: oauth_request } = await import("../oauth_request");

mockDb.saveSession.mockImplementation(async (session: SessionItem) => {
  mockResult[session.id] = session;
  if (session.id === "sessionid-001" || session.id === "sessionid-002") {
    return true;
  }
  return false;
});

describe("oauth_request", () => {
  it("FRONTEND_URLの環境変数がある場合はその値を利用すること", async () => {
    const response = await oauth_request(
      {
        state: "123456",
        client_id: "alexa-skill",
        redirect_uri: "https://xxxx.com",
        platform: "amazon",
      },
      { id: "sessionid-001", expire: 99999999 },
      true
    );
    expect(response.statusCode).toBe(301);
    const headers = response.headers;
    expect(headers).not.toBeUndefined();
    expect(headers!.Location).toBe("https://apps.mythrowaway.net/v5/index.html");
    expect(headers!["Set-Cookie"]).toBe(
      "throwaway-session=sessionid-001;max-age=3600;Path=/;SameSite=None;Secure;HttpOnly;"
    );

    const session = mockResult["sessionid-001"];
    expect(session.state).toBe("123456");
    expect(session.client_id).toBe("alexa-skill");
    expect(session.redirect_uri).toBe("https://xxxx.com");
    expect(session.platform).toBe("amazon");
    expect(session.expire).toBe(99999999);
  });
});
