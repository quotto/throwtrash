import { jest } from "@jest/globals";
import type { SessionItem } from "../interface";

process.env.FRONTEND_URL = "https://apps.mythrowaway.net/001";

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
  it("login with amazonでは、環境変数FRONTEND_URLが設定されている場合はそのステージをリダイレクト先URLに利用する", async (): Promise<void> => {
    const response = await signin({ access_token: "token-001", service: "amazon" }, { id: "session-id001", expire: 999998 });
    expect(response.statusCode).toBe(301);
    expect(response.headers).not.toBeUndefined();
    expect(response.headers!.Location).toBe("https://apps.mythrowaway.net/001/index.html");
    expect(response.headers!["Cache-Control"]).toBe("no-store");
  });
});
