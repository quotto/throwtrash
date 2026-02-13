import { jest } from "@jest/globals";
import error_def from "../error_def";

const mockDate = Date.UTC(2020, 3, 1, 12, 0, 0, 0);
const mockResult: any = {};

const mockDb = {
  getAuthorizationCode: jest.fn(),
  deleteAuthorizationCode: jest.fn(),
  putAccessToken: jest.fn(),
  putRefreshToken: jest.fn(),
  getRefreshToken: jest.fn(),
};

jest.unstable_mockModule("../dbadapter", () => ({
  default: mockDb,
}));

const common = await import("trash-common");
const logger = common.getLogger();
logger.setLevel_DEBUG();

const { default: request_accesstoken } = await import("../request_accesstoken");

mockDb.getAuthorizationCode.mockImplementation(async (code: string) => {
  if (code === "12345") {
    return {
      code,
      user_id: "id001",
      client_id: "alexa-skill",
      redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX",
      expires_in: 99999,
    };
  } else if (code === "56789") {
    return {
      code,
      user_id: "id002",
      client_id: "alexa-skill",
      redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX",
      expires_in: 99999,
    };
  } else if (code === "00000") {
    return {
      code,
      user_id: "id003",
      client_id: "alexa-skill",
      redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX",
      expires_in: 99999,
    };
  } else if (code === "99999") {
    throw new Error("Get code Error");
  } else if (code === "g0123") {
    return {
      code,
      user_id: "id-google-001",
      client_id: "google",
      redirect_uri: "https://alexa.amazon.co.jp/api/skill/link/XXXXXX",
      expires_in: 99999,
    };
  }
  return undefined;
});

mockDb.deleteAuthorizationCode.mockResolvedValue(true);

mockDb.putAccessToken.mockImplementation(async (user_id: string, client_id: string, expires_in: number) => {
  if (user_id === "id001") {
    mockResult["accesstoken001"] = {
      client_id,
      expires_in: Math.ceil(mockDate / 1000) + expires_in,
    };
    return "accesstoken001";
  } else if (user_id === "id002") {
    throw new Error("AccessToken DB Error");
  } else if (user_id === "id004") {
    mockResult["accesstoken004"] = {
      client_id,
      expires_in: Math.ceil(mockDate / 1000) + expires_in,
    };
    return "accesstoken004";
  } else if (user_id === "id-google-001") {
    mockResult["accesstoken-google-001"] = {
      client_id,
      expires_in: Math.ceil(mockDate / 1000) + expires_in,
    };
    return "accesstoken-google-001";
  }
  return "";
});

mockDb.putRefreshToken.mockImplementation(async (user_id: string, client_id: string, expires_in: number) => {
  if (user_id === "id001") {
    mockResult["refreshtoken001"] = {
      client_id,
      expires_in: Math.ceil(mockDate / 1000) + expires_in,
    };
    return "refreshtoken001";
  } else if (user_id === "id003") {
    throw new Error("RfreshToken DB Error");
  } else if (user_id === "id004") {
    mockResult["refreshtoken004"] = {
      client_id,
      expires_in: Math.ceil(mockDate / 1000) + expires_in,
    };
    return "new_refreshtoken004";
  } else if (user_id === "id-google-001") {
    mockResult["refreshtoken-google-001"] = {
      client_id,
      expires_in: Math.ceil(mockDate / 1000) + expires_in,
    };
    return "refreshtoken-google-001";
  }
  return "";
});

mockDb.getRefreshToken.mockImplementation(async (refresh_token: string) => {
  if (refresh_token === "refreshtoken004") {
    return {
      user_id: "id004",
      expires_in: 30 * 24 * 60 * 60,
      client_id: "alexa-skill",
      refresh_token: "refreshtoken004",
    };
  } else if (refresh_token === "error_refreshtoken") {
    throw new Error("Get RefreshToken Error");
  }
  return undefined;
});

describe("request_accesstoken", () => {
  const alexaAuthorization = "Basic YWxleGEtc2tpbGw6OGg2cEd4SGRXaDhy"; //alexa-skill:8h6pGxHdWh8r
  process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
  process.env.ALEXA_USER_SECRET = "8h6pGxHdWh8r";
  process.env.GOOGLE_USER_CLIENT_ID = "google";
  process.env.GOOGLE_USER_SECRET = "543kjfdfal";

  it("grant_type=authorization_code_alexa", async () => {
    const params = {
      code: "12345",
      grant_type: "authorization_code",
      client_id: "alexa-skill",
      redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX",
    };
    const result = await request_accesstoken(params, alexaAuthorization);
    expect(result.statusCode).toBe(200);

    expect(result.body).not.toBeUndefined();
    const body = JSON.parse(result.body!);
    expect(body.access_token).toBe("accesstoken001");
    expect(body.token_type).toBe("bearer");
    expect(body.refresh_token).toBe("refreshtoken001");
    expect(body.expires_in).toBe(30 * 24 * 60 * 60);

    expect(mockResult["accesstoken001"].client_id).toBe("alexa-skill");
    expect(mockResult["accesstoken001"].expires_in).toBe(Math.ceil(mockDate / 1000) + 30 * 24 * 60 * 60);
    expect(mockResult["refreshtoken001"].client_id).toBe("alexa-skill");
    expect(mockResult["refreshtoken001"].expires_in).toBe(Math.ceil(mockDate / 1000) + 180 * 24 * 60 * 60);
  });
  it("grant_type=authorization_code_google", async () => {
    const params = {
      code: "g0123",
      grant_type: "authorization_code",
      client_id: "google",
      redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX",
      client_secret: process.env.GOOGLE_USER_SECRET,
    };
    const result = await request_accesstoken(params, undefined);
    expect(result.statusCode).toBe(200);

    expect(result.body).not.toBeUndefined();

    const body = JSON.parse(result.body!);
    expect(body.access_token).toBe("accesstoken-google-001");
    expect(body.token_type).toBe("bearer");
    expect(body.refresh_token).toBe("refreshtoken-google-001");
    expect(body.expires_in).toBe(30 * 24 * 60 * 60);

    expect(mockResult["accesstoken-google-001"].client_id).toBe("google");
    expect(mockResult["accesstoken-google-001"].expires_in).toBe(Math.ceil(mockDate / 1000) + 30 * 24 * 60 * 60);
    expect(mockResult["refreshtoken-google-001"].client_id).toBe("google");
    expect(mockResult["refreshtoken-google-001"].expires_in).toBe(Math.ceil(mockDate / 1000) + 180 * 24 * 60 * 60);
  });
  it("grant_type=refresh_token_alexa", async () => {
    const params = {
      grant_type: "refresh_token",
      refresh_token: "refreshtoken004",
      client_id: "alexa-skill",
    };
    const result = await request_accesstoken(params, alexaAuthorization);
    expect(result.statusCode).toBe(200);

    expect(result.body).not.toBeUndefined();

    const body = JSON.parse(result.body!);
    expect(body.access_token).toBe("accesstoken004");
    expect(body.token_type).toBe("bearer");
    expect(body.refresh_token).toBe("new_refreshtoken004");
    expect(body.expires_in).toBe(30 * 24 * 60 * 60);

    expect(mockResult["accesstoken004"].client_id).toBe("alexa-skill");
    expect(mockResult["accesstoken004"].expires_in).toBe(Math.ceil(mockDate / 1000) + 30 * 24 * 60 * 60);
    expect(mockResult["refreshtoken004"].client_id).toBe("alexa-skill");
    expect(mockResult["refreshtoken004"].expires_in).toBe(Math.ceil(mockDate / 1000) + 180 * 24 * 60 * 60);
  });
  it("Authorization Code 取得エラー", async () => {
    const result = await request_accesstoken({ grant_type: "authorization_code", code: "99999", client_id: "alexa-skill" }, alexaAuthorization);
    expect(result).toMatchObject(error_def.ServerError);
  });
  it("AccessToken登録エラー", async () => {
    const params = {
      code: "56789",
      grant_type: "authorization_code",
      client_id: "alexa-skill",
      redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX",
    };
    const result = await request_accesstoken(params, alexaAuthorization);
    expect(result).toMatchObject(error_def.ServerError);
  });
  it("RefreshToken登録エラー", async () => {
    const params = {
      code: "00000",
      grant_type: "authorization_code",
      client_id: "alexa-skill",
      redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX",
    };
    const result = await request_accesstoken(params, alexaAuthorization);
    expect(result).toMatchObject(error_def.ServerError);
  });
  it("RefreshToken 取得エラー", async () => {
    const params = {
      grant_type: "refresh_token",
      refresh_token: "error_refreshtoken",
      client_id: "alexa-skill",
    };
    const result = await request_accesstoken(params, alexaAuthorization);
    expect(result).toMatchObject(error_def.ServerError);
  });
  it("RefreshTokenが存在しない", async () => {
    const params = {
      grant_type: "refresh_token",
      refresh_token: "none_refreshtoken",
      client_id: "alexa-skill",
    };
    const result = await request_accesstoken(params, alexaAuthorization);
    expect(result).toMatchObject(error_def.UserError);
  });
  it("client_idが一致しない", async () => {
    const params = {
      code: "12345",
      grant_type: "authorization_code",
      client_id: "mismatch",
      redirect_uri: "https%3A%2F%2Falexa.amazon.co.jp%2Fapi%2Fskill%2Flink%2FXXXXXX",
    };
    const result = await request_accesstoken(params, alexaAuthorization);
    expect(result).toMatchObject(error_def.UserError);
  });
  it("パラメータ不足 grant_typeなし", async () => {
    const result = await request_accesstoken({ code: "12345", client_id: "alexa-skill" } as any, alexaAuthorization);
    expect(result).toMatchObject(error_def.UserError);
  });
  it("パラメータ不足 client_idなし", async () => {
    const result = await request_accesstoken({ code: "12345", grant_type: "authorization_code" } as any, alexaAuthorization);
    expect(result).toMatchObject(error_def.UserError);
  });
  it("パラメータ不足 codeなし", async () => {
    const result = await request_accesstoken({ grant_type: "authorization_code", client_id: "alexa-skill" } as any, alexaAuthorization);
    expect(result).toMatchObject(error_def.UserError);
  });
  it("パラメータ不足 refresh_tokenなし", async () => {
    const result = await request_accesstoken({ grant_type: "refresh_token", client_id: "alexa-skill" } as any, alexaAuthorization);
    expect(result).toMatchObject(error_def.UserError);
  });
  it("Basic認証失敗", async () => {
    const result = await request_accesstoken({ grant_type: "authorization_code", code: "12345", client_id: "alexa-skill" }, "Basic invalid");
    expect(result).toMatchObject(error_def.UserError);
  });
});
