import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();
jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import { AccountLinkItem } from "../interface";
import start_link from "../start_link";
describe("start_link",()=>{
    it("正常終了：LoginWithAmazonによるアカウントリンク",async()=>{
        process.env.SKILL_STAGE = "development";
        process.env.ALEXA_CLIENT_ID="dummy_client_id";
        const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async(_: AccountLinkItem)=>true);

        const result = await start_link({user_id: "id001", platform: "web"}, "dev") as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(200);
        expect(result.headers!["Cache-Control"]).toBe("no-store");
        const body = JSON.parse(result.body!);
        // UUIDv4フフォーマッののハイフ無しであること
        expect(body.token.length).toBe(32);
        const loginMatchRe = /^https:\/\/www\.amazon\.com\/ap\/oa\?client_id=dummy_client_id&scope=alexa::skills:account_linking&skill_stage=development&response_type=code&state=.+&redirect_uri=https:\/\/mobileapp.mythrowaway.net\/accountlink$/;
        expect(loginMatchRe.exec(body.url)).toBeTruthy();
        expect(mockedPutAccountLinkItem).toBeCalledWith(expect.objectContaining({
            token: expect.any(String),
            user_id: "id001",
            state: expect.any(String),
            redirect_url: expect.stringMatching(/^https:\/\/mobileapp\.mythrowaway\.net\/accountlink$/),
            TTL: expect.any(Number)
        }));
    });
    describe("正常終了：Androidアプリによるアカウントリンク", () => {
        it("開発用スキル", async () => {
            process.env.SKILL_STAGE = "development";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);

            const result = await start_link({ user_id: "id001", platform: "android" }, "dev") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(200);
            expect(result.headers!["Cache-Control"]).toBe("no-store");
            const body = JSON.parse(result.body!);
            // UUIDv4フォーマットのハイフン無しであること
            expect(body.token.length).toBe(32);
            const loginMatchRe = /^https:\/\/alexa\.amazon\.com\/spa\/skill-account-linking-consent\?fragment=skill-account-linking-consent&client_id=dummy_client_id&scope=alexa::skills:account_linking&skill_stage=development&response_type=code&state=.{20}&redirect_uri=https:\/\/mobileapp.dev.mythrowaway.net\/accountlink$/
            expect(loginMatchRe.exec(body.url)).toBeTruthy();
            expect(mockedPutAccountLinkItem).toBeCalledWith(expect.objectContaining({
                token: expect.any(String),
                user_id: "id001",
                state: expect.any(String),
                redirect_url: expect.stringMatching(/^https:\/\/mobileapp\.dev\.mythrowaway\.net\/accountlink$/),
                TTL: expect.any(Number)
            }));
        });
        it("本番用スキル", async () => {
            process.env.SKILL_STAGE = "live";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);

            const result = await start_link({ user_id: "id001", platform: "android" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(200);
            expect(result.headers!["Cache-Control"]).toBe("no-store");
            const body = JSON.parse(result.body!);
            // UUIDv4フォーマットのハイフン無しであること
            expect(body.token.length).toBe(32);
            const loginMatchRe = /^https:\/\/alexa\.amazon\.com\/spa\/skill-account-linking-consent\?fragment=skill-account-linking-consent&client_id=dummy_client_id&scope=alexa::skills:account_linking&skill_stage=live&response_type=code&state=.{20}&redirect_uri=https:\/\/mobileapp.mythrowaway.net\/accountlink$/
            expect(loginMatchRe.exec(body.url)).toBeTruthy();
            expect(mockedPutAccountLinkItem).toBeCalledWith(expect.objectContaining({
                token: expect.any(String),
                user_id: "id001",
                state: expect.any(String),
                redirect_url: expect.stringMatching(/^https:\/\/mobileapp\.mythrowaway\.net\/accountlink$/),
                TTL: expect.any(Number)
            }));
        });
    });
    describe("正常終了：iOSアプリによるアカウントリンク", () => {
        it("開発用スキル", async () => {
            process.env.SKILL_STAGE = "development";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);
            const result = await start_link({ user_id: "id001", platform: "ios" }, "dev") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(200);
            expect(result.headers!["Cache-Control"]).toBe("no-store");
            const body = JSON.parse(result.body!);
            // UUIDv4フォーマットのハイフン無しであること
            expect(body.token.length).toBe(32);
            const loginMatchRe = /^https:\/\/alexa\.amazon\.com\/spa\/skill-account-linking-consent\?fragment=skill-account-linking-consent&client_id=dummy_client_id&scope=alexa::skills:account_linking&skill_stage=development&response_type=code&state=.{20}&redirect_uri=https:\/\/mobileapp.mythrowaway.net\/accountlink$/
            expect(loginMatchRe.exec(body.url)).toBeTruthy();
            expect(mockedPutAccountLinkItem).toBeCalledWith(expect.objectContaining({
                token: expect.any(String),
                user_id: "id001",
                state: expect.any(String),
                redirect_url: expect.stringMatching(/^https:\/\/mobileapp\.mythrowaway\.net\/accountlink$/),
                TTL: expect.any(Number)
            }));
        });
        it("本番用スキル", async () => {
            process.env.SKILL_STAGE = "live";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);
            const result = await start_link({ user_id: "id001", platform: "ios" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(200);
            expect(result.headers!["Cache-Control"]).toBe("no-store");
            const body = JSON.parse(result.body!);
            // UUIDv4フォーマットのハイフン無しであること
            expect(body.token.length).toBe(32);
            const loginMatchRe = /^https:\/\/alexa\.amazon\.com\/spa\/skill-account-linking-consent\?fragment=skill-account-linking-consent&client_id=dummy_client_id&scope=alexa::skills:account_linking&skill_stage=live&response_type=code&state=.{20}&redirect_uri=https:\/\/mobileapp.mythrowaway.net\/accountlink$/
            expect(loginMatchRe.exec(body.url)).toBeTruthy();
            expect(mockedPutAccountLinkItem).toBeCalledWith(expect.objectContaining({
                token: expect.any(String),
                user_id: "id001",
                state: expect.any(String),
                redirect_url: expect.stringMatching(/^https:\/\/mobileapp\.mythrowaway\.net\/accountlink$/),
                TTL: expect.any(Number)
            }));
        });
    });
    describe("異常系",()=>{
        it("パラメータuser_idが無い場合はユーザーエラー", async () => {
            process.env.SKILL_STAGE = "live";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);

            const result = await start_link({  platform: "android" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(400);
        });
        it("パラメータplatformが無い場合はユーザーエラー", async () => {
            process.env.SKILL_STAGE = "live";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);

            const result = await start_link({  user_id: "id001" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(400);
        });
        it("スキルステージの設定誤りの場合はサーバーエラー", async () => {
            process.env.SKILL_STAGE = "aiueo";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);

            const result = await start_link({ user_id: "id001", platform: "android" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(500);
        });
        it("スキルステージの設定漏れの場合はサーバーエラー", async () => {
            delete process.env.SKILL_STAGE;
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";
            const mockedPutAccountLinkItem = jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async (_: AccountLinkItem) => true);

            const result = await start_link({ user_id: "id001", platform: "android" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(500);
        });
        it("アレクサクライアントIDの設定漏れの場合はサーバーエラー", async () => {
            process.env.SKILL_STAGE = "live";
            delete process.env.ALEXA_CLIENT_ID;

            const result = await start_link({ user_id: "id001", platform: "android" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(500);
        });
        it("DB登録エラー場合はサーバーエラー", async () => {
            process.env.SKILL_STAGE = "live";
            process.env.ALEXA_CLIENT_ID = "dummy_client_id";

            jest.mocked(dbadapter.putAccountLinkItem).mockImplementation(async(_)=>false);

            const result = await start_link({ user_id: "id001", platform: "android" }, "v4") as APIGatewayProxyStructuredResultV2;
            expect(result.statusCode).toBe(500);
        });
    });
})