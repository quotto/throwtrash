import { jest } from "@jest/globals";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand, DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { fromEnv, fromSSO } from "@aws-sdk/credential-providers";
import crypto from "crypto";
import type { RawTrasScheduleItem, UserInfo } from "../interface";

const firestoreStore = new Map<string, Map<string, any>>();

const ensureCollection = (name: string) => {
  if (!firestoreStore.has(name)) {
    firestoreStore.set(name, new Map());
  }
  return firestoreStore.get(name)!;
};

const fakeFirestore = {
  collection: (name: string) => {
    const collection = ensureCollection(name);
    return {
      doc: (id: string) => ({
        create: async (data: any) => {
          if (collection.has(id)) {
            throw new Error("already exists");
          }
          collection.set(id, data);
          return { writeTime: { toString: () => "mock" } };
        },
        set: async (data: any) => {
          collection.set(id, data);
          return { writeTime: { toString: () => "mock" } };
        },
        get: async () => ({
          data: () => collection.get(id),
        }),
        delete: async () => {
          collection.delete(id);
          return { writeTime: { toString: () => "mock" } };
        },
      }),
    };
  },
};

jest.unstable_mockModule("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({})),
  applicationDefault: jest.fn(() => ({})),
}));

jest.unstable_mockModule("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => fakeFirestore),
}));

jest.unstable_mockModule("firebase-admin", () => ({
  default: {
    firestore: () => fakeFirestore,
  },
  firestore: () => fakeFirestore,
}));

const common = await import("trash-common");
const logger = common.getLogger();
logger.setLevel_DEBUG();

const { default: db, setDocumentClient } = await import("../dbadapter");
const property = (await import("../property")).default;
const firebase = (await import("firebase-admin")).default as any;

const resolveCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID) {
    console.log("Use Env Credentials:", process.env.AWS_ACCESS_KEY_ID);
    return fromEnv();
  }
  if (process.env.AWS_PROFILE) {
    console.log("Use SSO Profile:", process.env.AWS_PROFILE);
    return fromSSO({ profile: process.env.AWS_PROFILE });
  }
  return undefined;
};

const dynamoClient = new DynamoDBClient({
  region: process.env.DB_REGION,
  credentials: resolveCredentials(),
});
const documentClient = DynamoDBDocumentClient.from(dynamoClient);
setDocumentClient(documentClient);

const DEFAULT_EXPIRE = 4133862000000;

describe("getDataBySigninId", () => {
  const testdata = {
    id: "test-001",
    description: JSON.stringify([{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }]),
    signinId: "1111-1111-1111",
    globalExcludes: [{ date: "2026-02-09", reason: "test" }],
  };
  beforeAll(async () => {
    await documentClient.send(
      new PutCommand({
        TableName: property.SCHEDULE_TABLE,
        Item: testdata,
      })
    );
  });
  it("IDあり", async () => {
    const result = (await db.getDataBySigninId("1111-1111-1111")) as RawTrasScheduleItem;
    expect(result.id).toBe(testdata.id);
    expect(result.signinId).toBe(testdata.signinId);
    expect(result.description).toBe(testdata.description);
    expect(result.globalExcludes).toEqual(testdata.globalExcludes);
  });
  it("IDなし", async () => {
    const result = (await db.getDataBySigninId("xxxx-xxxx-xxxx")) as RawTrasScheduleItem;
    expect(JSON.stringify(result)).toBe("{}");
  });
  afterAll(async () => {
    await documentClient.send(
      new DeleteCommand({
        TableName: property.SCHEDULE_TABLE,
        Key: {
          id: "test-001",
        },
      })
    );
  });
});

describe("saveSession", () => {
  beforeAll(async () => {
    await documentClient.send(
      new PutCommand({
        TableName: property.SESSION_TABLE,
        Item: {
          id: "session002",
          expire: 3600,
          userInfo: {
            signinId: "amazon001",
            signinService: "amazon",
            preset: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }],
            id: "test002",
          },
        },
      })
    );
  });
  it("セッションテーブルに存在しないデータ", async () => {
    const session_data = { id: "session001", expire: 9999999 };
    const result = await db.saveSession(session_data);
    expect(result);

    documentClient
      .send(
        new GetCommand({
          TableName: property.SESSION_TABLE,
          Key: {
            id: "session001",
          },
        })
      )
      .then((data) => {
        expect(data.Item).not.toBeUndefined();
        expect(data.Item!.id).toBe("session001");
        expect(data.Item!.expire).toBeDefined();
      });
  });
  it("セッションテーブルに存在するデータ", async () => {
    const overwireUserInfo: UserInfo = {
      signinId: "google001",
      signinService: "google",
      preset: [{ type: "burn", schedules: [{ type: "weekday", value: "0" }] }],
      id: "test002",
      name: "testUser",
    };
    const session_data = { id: "session002", expire: 3600, userInfo: overwireUserInfo };
    const result = await db.saveSession(session_data);
    expect(result);
    await documentClient
      .send(
        new GetCommand({
          TableName: property.SESSION_TABLE,
          Key: {
            id: "session002",
          },
        })
      )
      .then((data) => {
        expect(data.Item).not.toBeUndefined();
        expect(data.Item!.id).toBe("session002");
        expect(data.Item!.userInfo).toMatchObject(overwireUserInfo);
        expect(data.Item!.expire).toBeDefined();
      });
  });
  afterAll(async () => {
    await documentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          "throwtrash-backend-session": [
            {
              DeleteRequest: {
                Key: { id: "session001" },
              },
            },
            {
              DeleteRequest: {
                Key: { id: "session002" },
              },
            },
          ],
        },
      })
    );
  });
});

describe("deleteSession", () => {
  beforeAll(async () => {
    await documentClient.send(
      new PutCommand({
        TableName: property.SESSION_TABLE,
        Item: {
          id: "test002",
          expire: 3600,
        },
      })
    );
  });
  it("存在しないセッションIDを削除", async () => {
    const result = await db.deleteSession("test001");
    expect(result);
  });
  it("存在するセッション", async () => {
    const result = await db.deleteSession("test002");
    expect(result);

    await documentClient
      .send(
        new GetCommand({
          TableName: property.SESSION_TABLE,
          Key: {
            id: "test002",
          },
        })
      )
      .then(() => expect(false))
      .catch(() => {
        expect(true);
      });
  });
  afterAll(async () => {
    await documentClient
      .send(
        new DeleteCommand({
          TableName: property.SESSION_TABLE,
          Key: {
            id: "test002",
          },
        })
      )
      .catch(() => undefined);
  });
});

describe("publishId", () => {
  const duplicate_id = "xxxxxxxx-xxxxxxxx-xxxxxxx-xxxxxxxx";
  beforeAll(async () => {
    await documentClient.send(
      new PutCommand({
        TableName: property.SCHEDULE_TABLE,
        Item: {
          id: duplicate_id,
        },
      })
    );
  });
  it("正常パターン", async () => {
    const id = await db.publishId();
    expect(id.length).toBe(36);
  });
  afterAll(async () => {
    await documentClient.send(
      new DeleteCommand({
        TableName: property.SCHEDULE_TABLE,
        Key: {
          id: duplicate_id,
        },
      })
    );
  });
});

describe("getSession", () => {
  const session_id_001 = "getSession_id_001";
  const session_id_002 = "getSession_id_002";
  const session_id_003 = "getSession_id_003";
  beforeAll(async () => {
    await documentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          "throwtrash-backend-session": [
            {
              PutRequest: {
                Item: { id: session_id_001, expire: DEFAULT_EXPIRE },
              },
            },
            {
              PutRequest: {
                Item: { id: session_id_002, expire: 1175796317300 },
              },
            },
          ],
        },
      })
    );
  });
  it("有効期限内", async () => {
    const session = await db.getSession(session_id_001);
    expect(JSON.stringify(session)).toBe(JSON.stringify({ id: session_id_001, expire: DEFAULT_EXPIRE }));
  });
  it("sessionIdナシ", async () => {
    const session = await db.getSession(session_id_003);
    expect(session).toBeUndefined();
  });
  afterAll(async () => {
    await documentClient.send(
      new BatchWriteCommand({
        RequestItems: {
          "throwtrash-backend-session": [
            {
              DeleteRequest: {
                Key: { id: session_id_001 },
              },
            },
          ],
        },
      })
    );
  });
});

describe("publishSession", () => {
  it("publish new session id", async () => {
    const session = await db.publishSession();
    expect(session).not.toBeNull();
    expect(session!.id.length).toBe(20);
    await documentClient
      .send(
        new GetCommand({
          TableName: property.SESSION_TABLE,
          Key: { id: session!.id },
        })
      )
      .then(async (data) => {
        expect(data.Item).not.toBeUndefined();
        expect(data.Item!.id).toBe(session!.id);
        await documentClient.send(
          new DeleteCommand({
            TableName: property.SESSION_TABLE,
            Key: { id: session!.id },
          })
        );
      });
  });
});

describe("putAuthorizationCode", () => {
  it("正常登録", async () => {
    const result = await db.putAuthorizationCode("id0001", "alexa-skill", "https://example.com/skill", 300);

    await documentClient
      .send(
        new GetCommand({
          TableName: property.AUTHORIZE_TABLE,
          Key: {
            code: result.code,
          },
        })
      )
      .then((data) => {
        expect(data.Item).not.toBeUndefined();
        expect(data.Item!.code).toBe(result.code);
        expect(data.Item!.client_id).toBe("alexa-skill");
        expect(data.Item!.redirect_uri).toBe("https://example.com/skill");
        expect(data.Item!.user_id).toBe("id0001");
        const expire = Math.ceil(Date.now() / 1000) + 300;
        expect(data.Item!.expires_in).toBeLessThan(expire + 10);
        expect(data.Item!.expires_in).toBeGreaterThan(expire - 10);
      });

    await documentClient.send(
      new DeleteCommand({
        TableName: property.AUTHORIZE_TABLE,
        Key: {
          code: result.code,
        },
      })
    );
  });
});

describe("deleteAuthorizationCode", () => {
  beforeAll(async () => {
    await documentClient.send(
      new PutCommand({
        TableName: property.AUTHORIZE_TABLE,
        Item: {
          code: "1234xyz",
        },
      })
    );
  });
  it("正常削除", async () => {
    const result = await db.deleteAuthorizationCode("1234xyz");
    expect(result).toBeTruthy();
  });
  it("存在しないデータ", async () => {
    const result = await db.deleteAuthorizationCode("not_exists_code");
    expect(result).toBeTruthy();
  });
});

describe("getAuthorizationCode", () => {
  beforeAll(async () => {
    await documentClient.send(
      new PutCommand({
        TableName: property.AUTHORIZE_TABLE,
        Item: {
          code: "1234567",
          client_id: "alexa-skill",
          user_id: "id001",
          redirect_uri: "https://example.com/skill",
          expires_in: Math.ceil(Date.now() / 1000) + 5 * 60,
        },
      })
    );
  });
  it("存在するデータ", async () => {
    const result = await db.getAuthorizationCode("1234567");
    expect(result).not.toBeUndefined();
    expect(result!.code).toBe("1234567");
    expect(result!.client_id).toBe("alexa-skill");
    expect(result!.user_id).toBe("id001");
    expect(result!.redirect_uri).toBe("https://example.com/skill");
  });
  it("存在しないデータ", async () => {
    const result = await db.getAuthorizationCode("9999999");
    expect(result).toBeUndefined();
  });
  afterAll(async () => {
    await documentClient.send(
      new DeleteCommand({
        TableName: property.AUTHORIZE_TABLE,
        Key: {
          code: "1234567",
        },
      })
    );
  });
});

describe("putAccessToken", () => {
  describe("正常登録", () => {
    it("amazon", async () => {
      process.env.ALEXA_USER_CLIENT_ID = "alexa-skill";
      const access_token = await db.putAccessToken("id0001", "alexa-skill", 300);
      expect(access_token).toBeDefined();

      const hashKey = crypto.createHash("sha512").update(access_token).digest("hex");
      await documentClient
        .send(
          new GetCommand({
            TableName: property.TOKEN_TABLE,
            Key: {
              access_token: hashKey,
            },
          })
        )
        .then((data) => {
          expect(data.Item).not.toBeUndefined();
          expect(data.Item!.user_id).toBe("id0001");
          expect(data.Item!.client_id).toBe("alexa-skill");
          const expire = Math.ceil(Date.now() / 1000) + 300;
          expect(data.Item!.expires_in).toBeLessThan(expire + 10);
          expect(data.Item!.expires_in).toBeGreaterThan(expire - 10);
        });

      await documentClient.send(
        new DeleteCommand({
          TableName: property.TOKEN_TABLE,
          Key: {
            access_token: hashKey,
          },
        })
      );
    });
    it("google", async () => {
      process.env.GOOGLE_USER_CLIENT_ID = "google";
      const access_token = await db.putAccessToken("id002", "google", 300);
      expect(access_token).toBeDefined();

      const hasKey = crypto.createHash("sha512").update(access_token).digest("hex");
      const firestore = firebase.firestore();
      await firestore
        .collection(property.TOKEN_TABLE)
        .doc(hasKey)
        .get()
        .then((doc: any) => {
          const data = doc.data();

          expect(data).not.toBeUndefined();
          expect(data!.user_id).toBe("id002");
          expect(data!.client_id).toBe("google");
          const expire = Math.ceil(Date.now() / 1000) + 300;
          expect(data!.expires_in).toBeLessThan(expire + 10);
          expect(data!.expires_in).toBeGreaterThan(expire - 10);
        });

      await firestore.collection(property.TOKEN_TABLE).doc(hasKey).delete();
    });
    it("client_idが一致しない", async () => {
      try {
        await db.putAccessToken("userid", "not_match_client", 1000);
        expect(false);
      } catch (err) {
        expect(true);
      }
    });
  });
});

describe("putRefreshToken", () => {
  it("正常登録", async () => {
    const refresh_token = await db.putRefreshToken("id0001", "alexa-skill", 300);
    expect(refresh_token).toBeDefined();

    const hashKey = crypto.createHash("sha512").update(refresh_token).digest("hex");
    await documentClient
      .send(
        new GetCommand({
          TableName: property.REFRESH_TABLE,
          Key: {
            refresh_token: hashKey,
          },
        })
      )
      .then((data) => {
        expect(data.Item).not.toBeUndefined();
        expect(data.Item!.refresh_token).toBe(hashKey);
        expect(data.Item!.user_id).toBe("id0001");
        expect(data.Item!.client_id).toBe("alexa-skill");
        const expire = Math.ceil(Date.now() / 1000) + 300;
        expect(data.Item!.expires_in).toBeLessThan(expire + 10);
        expect(data.Item!.expires_in).toBeGreaterThan(expire - 10);
      });

    await documentClient.send(
      new DeleteCommand({
        TableName: property.REFRESH_TABLE,
        Key: {
          refresh_token: hashKey,
        },
      })
    );
  });
});

describe("getRefreshToken", () => {
  const expires_in = Math.ceil(Date.now() / 1000) + 5 * 60;
  const cryptedToken = crypto.createHash("sha512").update("refreshtoken001").digest("hex");
  beforeAll(async () => {
    await documentClient.send(
      new PutCommand({
        TableName: property.REFRESH_TABLE,
        Item: {
          refresh_token: cryptedToken,
          client_id: "alexa-skill",
          user_id: "id001",
          expires_in: expires_in,
        },
      })
    );
  });
  it("正常取得", async () => {
    const result = await db.getRefreshToken("refreshtoken001");
    expect(result).not.toBeUndefined();
    expect(result!.refresh_token).toBe(cryptedToken);
    expect(result!.expires_in).toBe(expires_in);
    expect(result!.user_id).toBe("id001");
    expect(result!.client_id).toBe("alexa-skill");
  });
  it("存在しないデータ", async () => {
    const result = await db.getRefreshToken("not_exist_refreshtoken");
    expect(result).toBeUndefined();
  });
  afterAll(async () => {
    await documentClient.send(
      new DeleteCommand({
        TableName: property.REFRESH_TABLE,
        Key: {
          refresh_token: cryptedToken,
        },
      })
    );
  });
});
