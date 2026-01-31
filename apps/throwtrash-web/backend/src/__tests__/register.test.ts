import { jest } from "@jest/globals";
import type { EvweekValue } from "trash-common";

const todayMillis = Date.UTC(2020, 4, 20, 12, 0, 0, 0);
Date.now = jest.fn().mockReturnValue(todayMillis);

const mockScheduleResult: any = {};
const mockAuthResult: any = {};

const mockDb = {
  publishId: jest.fn(),
  putTrashSchedule: jest.fn(),
  deleteSession: jest.fn(),
  putAuthorizationCode: jest.fn(),
};

jest.unstable_mockModule("../dbadapter", () => ({
  default: mockDb,
}));

const common = await import("trash-common");
const logger = common.getLogger();
logger.setLevel_DEBUG();

const { default: register, adjustData } = await import("../register");

describe("register", () => {
  beforeEach(() => {
    mockDb.publishId.mockResolvedValue("id001");
    mockDb.putTrashSchedule.mockImplementation(async (item: any) => {
      mockScheduleResult[item.id] = item;
      return true;
    });
    mockDb.deleteSession.mockResolvedValue(true);
    mockDb.putAuthorizationCode.mockImplementation(
      async (user_id: string, client_id: string, redirect_uri: string, expire: number) => {
        const result = {
          code: "12345",
          user_id,
          client_id,
          redirect_uri,
          expires_in: Math.ceil(todayMillis / 1000) + expire,
        };
        mockAuthResult[result.code] = result;
        return result;
      }
    );
  });

  it("正常なリクエスト", async () => {
    const response = await register(
      { data: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }] },
      { id: "sessionid-001", redirect_uri: "https://xxxx.com", state: "state-value", client_id: "alexa-skill", platform: "amazon", expire: 9999999 }
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("https://xxxx.com?state=state-value&code=12345");
    expect(response.headers!["Cache-Control"]).toBe("no-store");

    expect(mockScheduleResult["id001"].id).toBe("id001");
    expect(mockScheduleResult["id001"].platform).toBe("amazon");
    expect(mockScheduleResult["id001"].description).toBe(
      JSON.stringify({ trashData: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }], globalExcludes: [] }, null, 2)
    );
    expect(mockScheduleResult["id001"].nextdayflag).toBeFalsy();

    const auth = mockAuthResult["12345"];
    expect(auth.user_id).toBe("id001");
    expect(auth.client_id).toBe("alexa-skill");
    expect(auth.redirect_uri).toBe("https://xxxx.com");
    expect(auth.expires_in).toBe(Math.ceil(todayMillis / 1000) + 300);
  });

  it("サインイン済み,id無し", async () => {
    const response = await register(
      { data: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }], nextdayflag: false },
      {
        id: "sessionid-001",
        redirect_uri: "https://xxxx.com",
        state: "state-value",
        client_id: "alexa-skill",
        platform: "amazon",
        expire: 9999999,
        userInfo: {
          name: "test-user",
          preset: [],
          signinId: "signinId002",
          signinService: "google",
        },
      }
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("https://xxxx.com?state=state-value&code=12345");
    expect(response.headers!["Cache-Control"]).toBe("no-store");

    expect(mockScheduleResult["id001"].id).toBe("id001");
    expect(mockScheduleResult["id001"].platform).toBe("amazon");
    expect(mockScheduleResult["id001"].description).toBe(
      JSON.stringify({ trashData: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }], globalExcludes: [] }, null, 2)
    );
    expect(mockScheduleResult["id001"].signinId).toBe("signinId002");
    expect(mockScheduleResult["id001"].signinService).toBe("google");
    expect(mockScheduleResult["id001"].nextdayflag).toBeFalsy();

    const auth = mockAuthResult["12345"];
    expect(auth.user_id).toBe("id001");
    expect(auth.client_id).toBe("alexa-skill");
    expect(auth.redirect_uri).toBe("https://xxxx.com");
    expect(auth.expires_in).toBe(Math.ceil(todayMillis / 1000) + 300);
  });

  it("サインイン済み,idあり", async () => {
    const response = await register(
      { data: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }], nextdayflag: true },
      {
        id: "sessionid-001",
        redirect_uri: "https://xxxx.com",
        state: "state-value",
        client_id: "alexa-skill",
        platform: "amazon",
        expire: 9999999,
        userInfo: {
          id: "id003",
          name: "test-user",
          preset: [],
          signinId: "signinId002",
          signinService: "google",
        },
      }
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("https://xxxx.com?state=state-value&code=12345");
    expect(response.headers!["Cache-Control"]).toBe("no-store");

    expect(mockScheduleResult["id003"].id).toBe("id003");
    expect(mockScheduleResult["id003"].platform).toBe("amazon");
    expect(mockScheduleResult["id003"].description).toBe(
      JSON.stringify({ trashData: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }], globalExcludes: [] }, null, 2)
    );
    expect(mockScheduleResult["id003"].signinId).toBe("signinId002");
    expect(mockScheduleResult["id003"].signinService).toBe("google");
    expect(mockScheduleResult["id003"].nextdayflag).toBeTruthy();

    const auth = mockAuthResult["12345"];
    expect(auth.user_id).toBe("id003");
    expect(auth.client_id).toBe("alexa-skill");
    expect(auth.redirect_uri).toBe("https://xxxx.com");
    expect(auth.expires_in).toBe(Math.ceil(todayMillis / 1000) + 300);
  });

  it("bodyがnull", async () => {
    const response = await register(null, { id: "sessionid-002", expire: 9999999 });
    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("Invalid Parameters");
  });

  it("登録データ異常", async () => {
    const response = await register(
      { data: [{ type: "other", schedules: [{ type: "weekday", value: "0" }] }] },
      { id: "sessionid-004", redirect_uri: "https://xxxx.com", state: "state-value", client_id: "alexa-skill", platform: "amazon", expire: 9999999 }
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("Bad Data");
  });

  it("全体例外日が10件を超えると失敗", async () => {
    const response = await register(
      {
        data: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }],
        globalExcludes: Array.from({ length: 11 }, (_, idx) => ({ month: 1, date: idx + 1 }))
      },
      { id: "sessionid-006", redirect_uri: "https://xxxx.com", state: "state-value", client_id: "alexa-skill", platform: "amazon", expire: 9999999 }
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("Bad Data");
  });
  it("全体例外日が不正値で失敗", async () => {
    const response = await register(
      {
        data: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }],
        globalExcludes: [{ month: 13, date: 1 }]
      },
      { id: "sessionid-007", redirect_uri: "https://xxxx.com", state: "state-value", client_id: "alexa-skill", platform: "amazon", expire: 9999999 }
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("Bad Data");
  });

  it("DB処理でエラー", async () => {
    mockDb.putTrashSchedule.mockImplementation(() => {
      throw new Error("putTrashSchedule Error");
    });
    mockDb.publishId.mockRejectedValue(new Error("Test Exception"));
    const response = await register(
      { data: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }] },
      { id: "sessionid-005", redirect_uri: "https://xxxx.com", state: "state-value", client_id: "alexa-skill", platform: "amazon", expire: 9999999 }
    );

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe("Registration Failed");
  });
});

describe("adjustData", () => {
  it("一つ以上のスケジュール登録があれば正常", async () => {
    const response = adjustData([
      { type: "burn", schedules: [{ type: "weekday", value: "0" }, { type: "none", value: "" }, { type: "none", value: "" }], excludes: [] },
    ]);
    expect(JSON.stringify(response!.trashData)).toBe('[{"type":"burn","schedules":[{"type":"weekday","value":"0"}],"excludes":[]}]');
    expect(response!.globalExcludes).toEqual([]);
  });
  it("trash.type=other", async () => {
    const response = adjustData([
      {
        type: "other",
        trash_val: "萌えるゴミ",
        schedules: [{ type: "weekday", value: "0" }, { type: "none", value: "" }, { type: "none", value: "" }],
        excludes: [{ month: 5, date: 4 }],
      },
    ]);
    expect(JSON.stringify(response!.trashData)).toBe(
      '[{"type":"other","schedules":[{"type":"weekday","value":"0"}],"excludes":[{"month":5,"date":4}],"trash_val":"萌えるゴミ"}]'
    );
    expect(response!.globalExcludes).toEqual([]);
  });
  it("evweek & start on saturday", async () => {
    const response = adjustData([
      { type: "other", trash_val: "萌えるゴミ", schedules: [{ type: "evweek", value: { weekday: "0", start: "2020-10-02", interval: 2 } as EvweekValue }], excludes: [{ month: 12, date: 3 }, { month: 1, date: 1 }] },
    ]);
    expect((response!.trashData[0].schedules[0].value as EvweekValue).start).toBe("2020-9-27");
  });
  it("evweek & start on sunday", async () => {
    const response = adjustData([
      { type: "other", trash_val: "萌えるゴミ", schedules: [{ type: "evweek", value: { weekday: "0", start: "2020-09-27", interval: 3 } as EvweekValue }], excludes: [] },
    ]);
    expect((response!.trashData[0].schedules[0].value as EvweekValue).start).toBe("2020-9-27");
  });
  it("nullのためエラー", async () => {
    const response = adjustData(null!);
    expect(response).toBeNull();
  });
  it("undefinedのためエラー", async () => {
    const response = adjustData(undefined!);
    expect(response).toBeNull();
  });
  it("global excludes invalid length", async () => {
    const response = adjustData(
      [
        { type: "burn", schedules: [{ type: "weekday", value: "0" }], excludes: [] }
      ],
      Array.from({ length: 11 }, (_, idx) => ({ month: 1, date: idx + 1 }))
    );
    expect(response).toBeNull();
  });
  it("global excludes invalid value", async () => {
    const response = adjustData(
      [
        { type: "burn", schedules: [{ type: "weekday", value: "0" }], excludes: [] }
      ],
      [{ month: 13, date: 1 }]
    );
    expect(response).toBeNull();
  });
  it("global excludes valid", async () => {
    const response = adjustData(
      [
        { type: "burn", schedules: [{ type: "weekday", value: "0" }], excludes: [] }
      ],
      [{ month: 1, date: 1 }]
    );
    expect(response).not.toBeNull();
    expect(response!.globalExcludes).toEqual([{ month: 1, date: 1 }]);
  });
});
