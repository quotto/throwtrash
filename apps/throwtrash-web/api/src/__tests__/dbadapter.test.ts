import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv, fromSSO } from "@aws-sdk/credential-providers";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dbadapter, { setDocumentClient } from "../dbadapter";

const resolveCredentials = () => {
    if (process.env.AWS_PROFILE) {
        console.log("Use SSO Profile:", process.env.AWS_PROFILE);
        return fromSSO({ profile: process.env.AWS_PROFILE });
    }
    if (process.env.AWS_ACCESS_KEY_ID) {
        console.log("Use Env Credentials:", process.env.AWS_ACCESS_KEY_ID);
        return fromEnv();
    }
    return undefined;
};

const createMockDocumentClient = () => {
    const dynamoClient = new DynamoDBClient({
        region: process.env.DB_REGION ?? "ap-northeast-1",
        credentials: resolveCredentials()
    });
    const documentClient = DynamoDBDocumentClient.from(dynamoClient);
    (documentClient as unknown as { send: jest.Mock }).send = jest.fn();
    return documentClient as DynamoDBDocumentClient & { send: jest.Mock };
};

describe("dbadapter.getAccountLinkItemByToken", () => {
    it("正常に取得できる", async () => {
        const documentClient = createMockDocumentClient();
        setDocumentClient(documentClient);
        documentClient.send.mockResolvedValueOnce({
            Item: {
                token: "token001",
                user_id: "user001",
                state: "state001",
                redirect_url: "https://example.com",
                TTL: 123456
            }
        });

        const result = await dbadapter.getAccountLinkItemByToken("token001");

        expect(documentClient.send).toHaveBeenCalledTimes(1);
        const command = documentClient.send.mock.calls[0][0];
        expect(command).toBeInstanceOf(GetCommand);
        expect(command.input.TableName).toBeDefined();
        expect(command.input.Key).toEqual({ token: "token001" });
        expect(result).not.toBeNull();
        expect(result?.token).toBe("token001");
    });

    it("対象が存在しない場合はnull", async () => {
        const documentClient = createMockDocumentClient();
        setDocumentClient(documentClient);
        documentClient.send.mockResolvedValueOnce({});

        const result = await dbadapter.getAccountLinkItemByToken("token-not-exist");

        expect(documentClient.send).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
    });
});

describe("dbadapter.putAccountLinkItem", () => {
    it("正常に登録できる", async () => {
        const documentClient = createMockDocumentClient();
        setDocumentClient(documentClient);
        documentClient.send.mockResolvedValueOnce({});

        const result = await dbadapter.putAccountLinkItem({
            token: "token002",
            user_id: "user002",
            state: "state002",
            redirect_url: "https://example.com",
            TTL: 123456
        });

        expect(documentClient.send).toHaveBeenCalledTimes(1);
        const command = documentClient.send.mock.calls[0][0];
        expect(command).toBeInstanceOf(PutCommand);
        expect(command.input.Item.token).toBe("token002");
        expect(result).toBe(true);
    });

    it("登録に失敗した場合はfalse", async () => {
        const documentClient = createMockDocumentClient();
        setDocumentClient(documentClient);
        documentClient.send.mockRejectedValueOnce(new Error("mock error"));

        const result = await dbadapter.putAccountLinkItem({
            token: "token003",
            user_id: "user003",
            state: "state003",
            redirect_url: "https://example.com",
            TTL: 123456
        });

        expect(documentClient.send).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
    });
});
