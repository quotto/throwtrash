import { jest } from "@jest/globals";
import type { SessionItem } from "../interface";

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

const { default: signout } = await import("../signout");

mockDb.saveSession.mockImplementation(async (session: SessionItem) => {
  mockResult[session.id] = session;
  return true;
});

describe("signout", () => {
  it("通常のサインアウト", async () => {
    const response = await signout({
      id: "sessionId",
      userInfo: { name: "testUser", signinId: "signin-id", signinService: "amazon", preset: [] },
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("signout");

    const session = mockResult["sessionId"];
    expect(session.userInfo).toBeUndefined();
  });
  it("サインインしていない", async () => {
    const response = await signout({ id: "sessionId" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("");
  });
});
