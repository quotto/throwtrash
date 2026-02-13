/* eslint-disable no-unused-vars */
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common";
jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import { TrashScheduleItem } from "../interface";
const logger = common.getLogger();
logger.setLevel_DEBUG();
const mockData001 = [
    {
        id: "1234567",
        type: "burn",
        trash_val: "",
        schedules: [
            {
                type: "weekday",
                value: "0"
            },{
                type: "biweek",
                value: "1-1"
            }
        ]
    },{
        id: "8901234",
        type: "other",
        trash_val: "生ゴミ",
        schedules: [
            {
                type: "evweek",
                value: {
                    weekday: "2",
                    start: "2020-03-10"
                }
            }
        ]
    }
];
const mockSharedData001 = [
    {
        id: "7654321",
        type: "paper",
        trash_val: "",
        schedules: [
            {
                type: "weekday",
                value: "0"
            },{
                type: "biweek",
                value: "1-1"
            }
        ]
    },{
        id: "010101010",
        type: "other",
        trash_val: "資源ゴミ",
        schedules: [
            {
                type: "evweek",
                value: {
                    weekday: "2",
                    start: "2020-03-10"
                }
            }
        ]
    }
];
const mockGlobalExcludes = [{ month: 1, date: 1 }];
const mockSchedule001 = mockData001;
const mockSharedSchedule001 = mockSharedData001;


import update from "../update";

describe("update",()=>{
    beforeEach(()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementation(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(mockData001),
                globalExcludes: mockGlobalExcludes,
                platform: "android",
                timestamp: 1234567
            }
        });
        jest.mocked(dbadapter.putExistTrashSchedule).mockImplementation(async(trashScheduleItem: TrashScheduleItem)=>true);
        jest.mocked(dbadapter.transactionUpdateScheduleAndSharedSchedule).mockImplementation(async(shared_id: string, trashScheduleItem: TrashScheduleItem, timestamp: number)=>true);
    });
    afterEach(()=>{
        jest.resetAllMocks();
    });
    it("shared_idが設定されていない場合の更新",async()=>{
        const result = await update({ description: JSON.stringify(mockSchedule001), platform: "android", id: "id001", timestamp: 1234567 }) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.timestamp).toBeGreaterThan(0);
        expect(jest.mocked(dbadapter.putExistTrashSchedule)).toBeCalledWith(expect.objectContaining({
            id: "id001",
            platform: "android",
            description: JSON.stringify(mockSchedule001),
            globalExcludes: mockGlobalExcludes
        }),expect.any(Number));
    });
    it("globalExcludesが指定された場合でも更新できる",async()=>{
        const inputGlobalExcludes = [{ month: 1, date: 1 }, { month: 12, date: 31 }];
        const result = await update({ description: JSON.stringify(mockSchedule001), platform: "android", id: "id001", timestamp: 1234567, globalExcludes: inputGlobalExcludes }) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.timestamp).toBeGreaterThan(0);
        expect(jest.mocked(dbadapter.putExistTrashSchedule)).toBeCalledWith(expect.objectContaining({
            id: "id001",
            platform: "android",
            description: JSON.stringify(mockSchedule001),
            globalExcludes: inputGlobalExcludes
        }),expect.any(Number));
    });
    it("shared_idが設定されている場合の更新",async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                shared_id: "share001",
                description: JSON.stringify(mockSharedSchedule001),
                platform: "android",
                globalExcludes: mockGlobalExcludes,
                timestamp: 1234567
            }
        })
        const result = await update({ description: JSON.stringify(mockSchedule001), platform: "android", id: "id001", timestamp: 1234567 }) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.timestamp).toBeGreaterThan(0);
        expect(jest.mocked(dbadapter.transactionUpdateScheduleAndSharedSchedule)).toBeCalledWith("share001",expect.objectContaining({
            description: JSON.stringify(mockSchedule001),
            platform: "android",
            id: "id001",
            globalExcludes: mockGlobalExcludes
        }),expect.any(Number));
    });
    it("タイムスタンプが一致しない場合はユーザーエラー",async()=>{
        const result = await update({id: "id001", description: JSON.stringify([{id: "100", type: "burn", trash_val: "", schedules: [{ type: "weekday", value: "0"}]}]),
        platform: "android",timestamp: 0}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
        console.log(result.body)
        const body = JSON.parse(result.body!);
        expect(body.timestamp).toBe(1234567);
    });
    it("タイムスタンプがnullの場合はユーザーエラー",async()=>{
        const result = await update({id: "id001", description: JSON.stringify([{type: "burn"}]),
        platform: "android"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("登録データが異常の場合はユーザーエラー",async()=>{
        const result = await update({id: "id001", description: JSON.stringify([{type: "burn"}]),
        platform: "android",timestamp: 1234567}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("globalExcludesが上限を超過している場合はユーザーエラー",async()=>{
        const overLimitExcludes = Array.from({ length: 11 }, (_, index) => ({ month: 1, date: index + 1 }));
        const result = await update({
            id: "id001",
            description: JSON.stringify(mockSchedule001),
            platform: "android",
            timestamp: 1234567,
            globalExcludes: overLimitExcludes
        }) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("putExistTrashScheduleがエラーの場合はサーバーエラー",async()=>{
        const mockedPutExistTrashSchedule = jest.mocked(dbadapter.putExistTrashSchedule).mockImplementationOnce(async(_: TrashScheduleItem)=>false);
        const result = await update({id: "id002", description: JSON.stringify(mockSchedule001), platform: "android", timestamp: 1234567}) as APIGatewayProxyStructuredResultV2;
        expect(mockedPutExistTrashSchedule).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
    it("transactionUpdateScheduleがエラーの場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                shared_id: "share001",
                description: JSON.stringify(mockSharedSchedule001),
                platform: "android",
                globalExcludes: mockGlobalExcludes,
                timestamp: 1234567
            }
        })
        const mockedTransactionUpdateSchedule = jest.mocked(dbadapter.transactionUpdateScheduleAndSharedSchedule).mockImplementationOnce(async(shared_id: string, scheduleItem: TrashScheduleItem,timestamp: number)=>false);
        const result = await update({id: "id002", description: JSON.stringify(mockSchedule001), platform: "android", timestamp: 1234567}) as APIGatewayProxyStructuredResultV2;
        expect(mockedTransactionUpdateSchedule).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
})
