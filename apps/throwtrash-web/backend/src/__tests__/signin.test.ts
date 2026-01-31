import { jest } from "@jest/globals";
import type { SessionItem } from "../interface";

jest.setTimeout(100000);

const mockResult: { [key: string]: SessionItem } = {};
const mockData = [{
  trashData: [{ type: "burn", schedules: [{ type: "weekday", value: "1" }] }],
  globalExcludes: [{ month: 1, date: 1 }]
}];

const mockDb = {
  getDataBySigninId: jest.fn(),
  saveSession: jest.fn(),
};

jest.unstable_mockModule("../dbadapter", () => ({
  default: mockDb,
}));

jest.unstable_mockModule("request-promise", () => ({
  __esModule: true,
  default: async (options: any) => {
    if (options.uri === "https://api.amazon.com/user/profile") {
      if (options.qs.access_token === "token-001") {
        return {
          statusCode: 200,
          body: {
            user_id: "amazon-xxxxx",
            name: "テスト1",
          },
        };
      } else if (options.qs.access_token === "token-002") {
        return {
          statusCode: 500,
        };
      } else if (options.qs.access_token === "token-003") {
        throw new Error("Test Exception");
      }
    } else if (options.uri === "https://oauth2.googleapis.com/token") {
      if (options.body.code === "code-001") {
        return {
          id_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUteHh4eHgiLCJuYW1lIjoi44OG44K544OIMSJ9.rfbozVsH7JzyYRLYoVPe2astjxiAT-TyjFoDXsTGovk",
        };
      } else if (options.body.code === "code-002") {
        return {
          statusCode: 500,
        };
      } else if (options.body.code === "code-003") {
        throw new Error("Test Exception");
      } else if (options.body.code === "code-004") {
        return {
          id_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJnb29nbGUteXl5eXkiLCJuYW1lIjoi44OG44K544OIMiJ9.BV3RQjYOJ5ZSmCeUpsLQ89y6YLY84FPEMedn6NFSftQ",
        };
      }
    }
    return undefined;
  },
}));

const common = await import("trash-common");
const logger = common.getLogger();
logger.setLevel_DEBUG();

const { default: signin } = await import("../signin");

const URL_400 = "https://apps.mythrowaway.net/400.html";
const URL_500 = "https://apps.mythrowaway.net/500.html";

mockDb.getDataBySigninId.mockImplementation(async (signinId: string) => {
  if (signinId === "signinid-error") {
    throw new Error("Test Exception");
  } else if (signinId === "amazon-xxxxx") {
    return { id: "id001", description: JSON.stringify(mockData[0], null, 2) };
  } else if (signinId === "google-xxxxx") {
    return { id: "id002", description: JSON.stringify(mockData[0], null, 2) };
  }
  return {};
});

mockDb.saveSession.mockImplementation(async (session: SessionItem) => {
  mockResult[session.id] = session;
  return true;
});

describe("signin", () => {
  it("amazon,環境変数FRONTEND_URLが未設定の場合はデフォルト値がリダイレクト先に指定されること", async (): Promise<void> => {
    const response = await signin(
      { access_token: "token-001", service: "amazon" },
      { id: "session-id001", expire: 999998 }
    );
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe("https://apps.mythrowaway.net/index.html");
    expect(response.headers!["Cache-Control"]).toBe("no-store");

    const session = mockResult["session-id001"];
    expect(session.userInfo).not.toBeUndefined();
    expect(session.userInfo!.id).toBe("id001");
    expect(JSON.stringify(session.userInfo!.preset)).toBe(JSON.stringify(mockData[0].trashData));
    expect(session.userInfo!.globalExcludes).toEqual(mockData[0].globalExcludes);
    expect(session.userInfo!.signinId).toBe("amazon-xxxxx");
    expect(session.userInfo!.name).toBe("テスト1");
    expect(session.userInfo!.signinService).toBe("amazon");
  });
  it("google", async () => {
    const response = await signin(
      { code: "code-001", state: "google-state-value", service: "google" },
      { id: "session-id002", googleState: "google-state-value", expire: 9999999 }
    );
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe("https://apps.mythrowaway.net/index.html");
    expect(response.headers!["Cache-Control"]).toBe("no-store");

    const session = mockResult["session-id002"];
    expect(session.userInfo).not.toBeUndefined();
    expect(session.userInfo!.id).toBe("id002");
    expect(JSON.stringify(session.userInfo!.preset)).toBe(JSON.stringify(mockData[0].trashData));
    expect(session.userInfo!.globalExcludes).toEqual(mockData[0].globalExcludes);
    expect(session.userInfo!.signinId).toBe("google-xxxxx");
    expect(session.userInfo!.name).toBe("テスト1");
    expect(session.userInfo!.signinService).toBe("google");
  });
  it("まだ登録したことがない（idなし）", async () => {
    const response = await signin(
      { code: "code-004", state: "google-state-value", service: "google" },
      { id: "session-id003", googleState: "google-state-value", expire: 9999999 }
    );
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe("https://apps.mythrowaway.net/index.html");
    expect(response.headers!["Cache-Control"]).toBe("no-store");

    const session = mockResult["session-id003"];
    expect(session.userInfo).not.toBeUndefined();
    expect(session.userInfo!.id).toBeUndefined();
    expect(JSON.stringify(session.userInfo!.preset)).toBe("[]");
    expect(session.userInfo!.globalExcludes).toEqual([]);
    expect(session.userInfo!.signinId).toBe("google-yyyyy");
    expect(session.userInfo!.name).toBe("テスト2");
    expect(session.userInfo!.signinService).toBe("google");
  });
  it("規定外のサービス", async () => {
    const response = await signin({ code: "12345", service: "another" }, { id: "session-id", expire: 9999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe(URL_400);
  });
  it("サービスへのリクエストエラー", async () => {
    const response = await signin({ access_token: "token-002", service: "amazon" }, { id: "session-id", expire: 9999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe(URL_500);
  });
  it("データ取得で異常", async () => {
    const response = await signin({ access_token: "12345", service: "amazon" }, { id: "session-id", expire: 9999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe(URL_500);
  });
  it("パラーメーターの不足（Google,codeがない）", async () => {
    const response = await signin({ service: "google" }, { id: "session-id", expire: 9999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe(URL_400);
  });
  it("パラーメーターの不足（Google,state不一致）", async () => {
    const response = await signin({ code: 1234, service: "google", state: "invalid-state" }, { id: "session-id", state: "valid-state", expire: 9999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe(URL_400);
  });
  it("パラメーターの不足（Google,stateが無い）", async () => {
    const response = await signin({ code: "12345", service: "google" }, { id: "session-id", expire: 9999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe(URL_400);
  });
  it("パラーメーターの不足（amazon,access_tokenが無い）", async () => {
    const response = await signin({ service: "amazon" }, { id: "session-id", expire: 9999999 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe(URL_400);
  });
  it("requestAmazonProfileで異常終了", async () => {
    try {
      await signin({ access_token: "token-003", service: "amazon" }, { id: "session-id001", expire: 999998 });
    } catch (err: any) {
      expect(err.message).toBe("Amazon Signin Failed");
    }
  });
  it("requestGoogleProfileで異常終了", async () => {
    try {
      await signin(
        { code: "code-003", state: "google-state-value", service: "google" },
        { id: "session-id002", googleState: "google-state-value", expire: 9999999 }
      );
    } catch (err: any) {
      expect(err.message).toBe("Google Signin Failed");
    }
  });
});
