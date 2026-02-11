import { jest } from "@jest/globals";

process.env.DB_REGION = process.env.DB_REGION ?? "us-east-1";

jest.unstable_mockModule("firebase-admin/app", () => ({
  initializeApp: jest.fn(() => ({})),
  applicationDefault: jest.fn(() => ({})),
}));

jest.unstable_mockModule("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({
    collection: () => ({
      doc: () => ({
        create: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
      }),
    }),
  })),
}));

const { QueryCommand, GetCommand } = await import("@aws-sdk/lib-dynamodb");
const { default: db, setDocumentClient } = await import("../dbadapter");

describe("getDataBySigninId", () => {
  it("GSI結果にglobalExcludesが無い場合でも本体取得で補完する", async () => {
    const send = jest.fn(async (command: unknown) => {
      if (command instanceof QueryCommand) {
        return {
          Count: 1,
          Items: [
            {
              id: "id-001",
              description: "[]",
              signinId: "signin-001",
            },
          ],
        };
      }
      if (command instanceof GetCommand) {
        return {
          Item: {
            id: "id-001",
            description: "[]",
            signinId: "signin-001",
            globalExcludes: [{ month: 2, date: 3 }],
          },
        };
      }
      return {};
    });

    setDocumentClient({ send } as any);

    const result = (await db.getDataBySigninId("signin-001")) as {
      id: string;
      globalExcludes?: Array<{ month: number; date: number }>;
    };

    expect(result.id).toBe("id-001");
    expect(result.globalExcludes).toEqual([{ month: 2, date: 3 }]);
  });
});
