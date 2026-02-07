import { jest } from "@jest/globals";
import type { SessionItem } from "../interface";

process.env.AUTHORIZATION_ENDPOINT = "https://apps.mythrowaway.net/v5";

const mockResult: { [key: string]: SessionItem } = {};

const mockDb = {
  saveSession: jest.fn(),
};

const mockCommon = {
  generateRandomCode: jest.fn(),
  getLogger: () => ({
    setLevel_DEBUG: () => undefined,
  }),
};

jest.unstable_mockModule("../dbadapter", () => ({
  default: mockDb,
}));

jest.unstable_mockModule("trash-common", () => ({
  ...mockCommon,
}));

const { default: google_signin } = await import("../google_signin");

mockCommon.generateRandomCode.mockImplementation((length: number) => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += "a";
  }
  return code;
});

mockDb.saveSession.mockImplementation(async (session: SessionItem) => {
  mockResult[session.id] = session;
  return true;
});

describe("google_signin", () => {
  it("正常リクエスト", async () => {
    process.env.GOOGLE_CLIENT_ID = "clientId";
    const response = await google_signin({ id: "hogehoge", expire: 99999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).not.toBeUndefined();
    expect(response.headers!.Location!).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=clientId&response_type=code&scope=openid profile&redirect_uri=https://apps.mythrowaway.net/v5/signin?service=google&state=aaaaaaaaaaaaaaaaaaaa&login_hint=mythrowaway.net@gmail.com&nonce=aaaaaaaaaaaaaaaa"
    );
    expect(response.headers!["Cache-Control"]).toBe("no-store");

    const session = mockResult["hogehoge"];
    expect(session.googleState).toBe("aaaaaaaaaaaaaaaaaaaa");
  });
});
