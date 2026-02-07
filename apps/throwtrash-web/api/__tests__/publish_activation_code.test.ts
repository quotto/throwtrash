/* eslint-disable no-unused-vars */
import * as common  from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();

import publish_activation_code from "../publish_activation_code";
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import { ActivationCodeItem, CodeItem, TrashScheduleItem } from "../interface";

describe("publish_activation_code",()=>{
    beforeEach(()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementation(async(user_id: string)=>{
            return {
                id: user_id,
                platform: "android",
                description: JSON.stringify({})
            };
        });

        jest.mocked(dbadapter.setSharedIdToTrashSchedule).mockImplementation(async(user_id: string, shared_id: string)=>true);

        jest.mocked(dbadapter.putSharedSchedule).mockImplementation(async(shared_id: string, scheduleItem: TrashScheduleItem)=>true);

        jest.mocked(dbadapter.putActivationCode).mockImplementation(async(activationCodeItem: ActivationCodeItem)=>{return true});

    });
    afterEach(()=>{
        jest.resetAllMocks();
    });
    it("shared_idが設定されていない場合は新規にshared_idを採番する",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                platform: "android",
                description: JSON.stringify({})
            };
        });
        const result = await publish_activation_code({ user_id: "id001" }) as APIGatewayProxyStructuredResultV2;
        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        expect(jest.mocked(dbadapter.setSharedIdToTrashSchedule)).toBeCalledWith("id001", expect.any(String));
        expect(jest.mocked(dbadapter.putSharedSchedule)).toBeCalledWith(expect.any(String), expect.objectContaining({
            id: "id001",
            description: JSON.stringify({}),
            platform: "android"
        }));
        expect(jest.mocked(dbadapter.putActivationCode)).toBeCalledWith(expect.objectContaining({
            code: expect.any(String),
            shared_id: expect.any(String),
            TTL: expect.any(Number)
        }));
        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body!);
        expect(body.code.length).toBe(10);

    });
    it("shared_idが設定されている場合は既存のshared_idでアクティベーションコードを発行する",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                shared_id: "share001",
                platform: "android",
                description: JSON.stringify({})
            };
        });
        const result = await publish_activation_code({ user_id: "id001" }) as APIGatewayProxyStructuredResultV2;
        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        // setSharedIdToTrashScheduleは実行されていないこと
        expect(jest.mocked(dbadapter.setSharedIdToTrashSchedule)).toBeCalledTimes(0);
        expect(jest.mocked(dbadapter.putActivationCode)).toBeCalledWith(expect.objectContaining({
            code: expect.any(String),
            shared_id: "share001",
            TTL: expect.any(Number)
        }));
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.code.length).toBe(10);

    });
    it("user_idが無い場合はユーザエラー",async()=>{
        const result = await publish_activation_code({ }) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("TrashScheduleItemが見つからない場合はユーザエラー",async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{return null});
        const result = await publish_activation_code({ user_id: "id003" }) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("setSharedIdToTrashScheduleが失敗した場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.setSharedIdToTrashSchedule).mockImplementationOnce(async(user_id: string, shared_id: string)=>false);
        const result = await publish_activation_code({ user_id: "id001" }) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.setSharedIdToTrashSchedule)).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
    it("putSharedScheduleが失敗した場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.putSharedSchedule).mockImplementationOnce(async(shared_id: string, trashScheduleItem: TrashScheduleItem)=>false);
        const result = await publish_activation_code({ user_id: "id001" }) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.putSharedSchedule)).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
    it("ActivationCodeの登録を5回以上失敗したらサーバーエラー", async()=>{
        // ループ内で複複実行されるためmockImplementationOnceではなくmockImplementationを利用
        jest.mocked(dbadapter.putActivationCode).mockImplementation(async(activationCodeItem: ActivationCodeItem)=>{return false});
        const result = await publish_activation_code({ user_id: "id004" }) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(500);
    });
})