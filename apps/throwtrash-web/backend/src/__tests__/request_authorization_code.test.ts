import { jest } from "@jest/globals";
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

const mockDb = {
  putAuthorizationCode: jest.fn(),
};

const mockFirestore = {} as any;

jest.unstable_mockModule("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({})),
  applicationDefault: jest.fn(() => ({})),
}));

jest.unstable_mockModule("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => mockFirestore),
}));

jest.unstable_mockModule("../dbadapter", () => ({
  default: mockDb,
}));

const { default: request_authorization_code } = await import("../request_authorization_code");

describe("正常系", () => {
  it("正常にコードが発行される", async () => {
    const mockedPutAuthorizationCode = mockDb.putAuthorizationCode.mockImplementation(
      async (user_id: string, client_id: string, redirect_uri: string, _expires_in: number) => ({
        code: "12345",
        user_id,
        client_id,
        redirect_uri,
        expires_in: 11111,
      })
    );
    const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({
      user_id: "id001",
      redirect_uri: "https://dummy.client.net",
      client_id: "dummy_client_id",
    });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body!).code).toBe("12345");
    expect(mockedPutAuthorizationCode).toBeCalledWith("id001", "dummy_client_id", "https://dummy.client.net", 600);
  });
});

describe("異異系", () => {
  it("パラメーターにuser_idが無い場合ユーザエラー", async () => {
    const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({
      redirect_uri: "https://dummy.client.net",
      client_id: "dummy_client_id",
    });
    expect(result.statusCode).toBe(400);
  });
  it("パラメーターにclient_idが無い場合ユーザエラー", async () => {
    const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({
      user_id: "id001",
      redirect_uri: "https://dummy.client.net",
    });
    expect(result.statusCode).toBe(400);
  });
  it("パラメーターにresirect_idが無い場合ユーザエラー", async () => {
    const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({
      user_id: "id001",
      client_id: "dummy_client_id",
    });
    expect(result.statusCode).toBe(400);
  });
  it("DB処理で異常があった場合サーバーエラー", async () => {
    mockDb.putAuthorizationCode.mockImplementation(async () => {
      throw new Error("Unxpected Error");
    });
    const result: APIGatewayProxyStructuredResultV2 = await request_authorization_code({
      user_id: "id001",
      client_id: "dummy_client_id",
    });
    expect(result.statusCode).toBe(400);
  });
});
