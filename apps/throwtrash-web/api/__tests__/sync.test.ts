/* eslint-disable no-unused-vars */
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common";
jest.mock("../dbadapter")
import dbadapter from "../dbadapter";
import { TrashScheduleItem } from "../interface";
const logger = common.getLogger();
logger.setLevel_DEBUG();
import sync from "../sync";

const testDescription = [
    {
        id: "1234567",
        type: "burn",
        trash_val: "",
        schedules: [
            {
                type: "weekday",
                value: "0"
            }, {
                type: "biweek",
                value: "1-1"
            }
        ]
    }, {
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
]

const testSharedDescription = [
    {
        id: "987654321",
        type: "plastic",
        trash_val: "",
        schedules: [
            {
                type: "weekday",
                value: "0"
            }, {
                type: "biweek",
                value: "1-1"
            }
        ]
    }, {
        id: "111111111",
        type: "other",
        trash_val: "段ボール",
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
]
describe("sync",()=>{
    beforeEach(()=>{
        jest.mocked(dbadapter.putExistTrashSchedule).mockImplementation(async(trashScheduleItem: TrashScheduleItem, timestamp: number)=>true);
        jest.mocked(dbadapter.putSharedSchedule).mockImplementation(async(shared_id: string, trashScheduleItem: TrashScheduleItem)=>true);
    })
    afterEach(()=>{
        jest.resetAllMocks();
    })
    it("shared_id未設定",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                platform: "android",
                timestamp: 99999999
            }
        });

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        expect(jest.mocked(dbadapter.getSharedScheduleBySharedId)).toHaveBeenCalledTimes(0);
        expect(result.statusCode).toBe(200);
        expect(body.id).toBe("id001");
        expect(body.platform).toBe("android");
        expect(body.description).toBe(JSON.stringify(testDescription));
        expect(body.timestamp).toBe(99999999);
    });
    it("SharedTableScheduleのタイムスタンプが大きい場合はTrashScheduleを更新する",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                shared_id: "share001",
                platform: "android",
                timestamp: 88888888
            }
        });
        const mockedGetSharedScheduleBySharedId = jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementation(async(shared_id: string)=>{
            return {
                shared_id: shared_id,
                description: JSON.stringify(testSharedDescription),
                timestamp: 999999999
            }
        });

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        expect(mockedGetSharedScheduleBySharedId).toBeCalledWith("share001");
        expect(jest.mocked(dbadapter.putExistTrashSchedule)).toBeCalledWith(expect.objectContaining({
            id: "id001",
            description: JSON.stringify(testSharedDescription),
            platform: "android",
            timestamp: 999999999
        }),999999999);
        expect(result.statusCode).toBe(200);
        expect(body.id).toBe("id001");
        expect(body.platform).toBe("android");
        expect(body.description).toBe(JSON.stringify(testSharedDescription));
        expect(body.timestamp).toBe(999999999);
    });
    it("SharedTableScheduleのタイムスタンプが同じ場合TrashScheduleを更新する",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                shared_id: "share001",
                platform: "android",
                timestamp: 999999999
            }
        });
        const mockedGetSharedScheduleBySharedId = jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementation(async(shared_id: string)=>{
            return {
                shared_id: shared_id,
                description: JSON.stringify(testSharedDescription),
                timestamp: 999999999
            }
        });

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        expect(mockedGetSharedScheduleBySharedId).toBeCalledWith("share001");
        expect(jest.mocked(dbadapter.putExistTrashSchedule)).toBeCalledWith(expect.objectContaining({
            id: "id001",
            description: JSON.stringify(testSharedDescription),
            platform: "android",
            timestamp: 999999999
        }),999999999);
        expect(result.statusCode).toBe(200);
        expect(body.id).toBe("id001");
        expect(body.platform).toBe("android");
        expect(body.description).toBe(JSON.stringify(testSharedDescription));
        expect(body.timestamp).toBe(999999999);
    });
    it("TrashScheduleのtimestampがundefinedの場はSharedScheduleで更新する",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                shared_id: "share001",
                platform: "android"
            }
        });
        const mockedGetSharedScheduleBySharedId = jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementation(async(shared_id: string)=>{
            return {
                shared_id: shared_id,
                description: JSON.stringify(testSharedDescription),
                timestamp: 999999999
            }
        });

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        expect(mockedGetSharedScheduleBySharedId).toBeCalledWith("share001");
        expect(jest.mocked(dbadapter.putExistTrashSchedule)).toBeCalledWith(expect.objectContaining({
            id: "id001",
            description: JSON.stringify(testSharedDescription),
            platform: "android",
            timestamp: 999999999
        }),999999999);
        expect(result.statusCode).toBe(200);
        expect(body.id).toBe("id001");
        expect(body.platform).toBe("android");
        expect(body.description).toBe(JSON.stringify(testSharedDescription));
        expect(body.timestamp).toBe(999999999);
    });
    it("SharedTableScheduleのタイムスタンプが小さい場合はSharedScheduleをTrashScheduleで更新する",async()=>{
        const mockedGetTrashSchedule = jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                shared_id: "share001",
                platform: "android",
                timestamp: 999999999
            }
        });
        const mockedGetSharedScheduleBySharedId = jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementation(async(shared_id: string)=>{
            return {
                shared_id: shared_id,
                description: JSON.stringify(testSharedDescription),
                timestamp: 88888888
            }
        });

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(mockedGetTrashSchedule).toBeCalledWith("id001");
        expect(mockedGetSharedScheduleBySharedId).toBeCalledWith("share001");
        expect(jest.mocked(dbadapter.putSharedSchedule)).toBeCalledWith("share001",expect.objectContaining({
            id: "id001",
            description: JSON.stringify(testDescription),
            platform: "android",
            timestamp: 999999999
        }));
        expect(result.statusCode).toBe(200);
        expect(body.id).toBe("id001");
        expect(body.platform).toBe("android");
        expect(body.description).toBe(JSON.stringify(testDescription));
        expect(body.timestamp).toBe(999999999);
    });
    it("パラメーにuser_idが無い場合はユーザーエラー",async()=>{
        const result = await sync({}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("ユーザーIDでスケジュールが取得できない場合はユーザーエラー",async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{return null});
        const result = await sync({user_id: "id003"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("SharedScheduleが存在しない場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                shared_id: "share001",
                platform: "android",
                timestamp: 88888888
            }
        });
        const mockedGetSharedScheduleBySharedId = jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementationOnce(async(shared_id: string)=>null);

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.getTrashScheduleByUserId)).toBeCalled();
        expect(mockedGetSharedScheduleBySharedId).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
    it("putExistTrashScheduleがエラー場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.putExistTrashSchedule).mockImplementationOnce(async(trashScheduleItem: TrashScheduleItem, timestamp: number)=>false);
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                shared_id: "share001",
                platform: "android",
                timestamp: 88888888
            }
        });
        jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementationOnce(async(shared_id: string)=>{
            return {
                shared_id: shared_id,
                description: JSON.stringify(testSharedDescription),
                timestamp: 999999999
            }
        });

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.putExistTrashSchedule)).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
    it("putSharedScheduleがエラー場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.putSharedSchedule).mockImplementationOnce(async(shared_id: string,trashScheduleItem: TrashScheduleItem)=>false);
        jest.mocked(dbadapter.getTrashScheduleByUserId).mockImplementationOnce(async(user_id: string)=>{
            return {
                id: user_id,
                description: JSON.stringify(testDescription),
                shared_id: "share001",
                platform: "android",
                timestamp: 999999999
            }
        });
        jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementationOnce(async(shared_id: string)=>{
            return {
                shared_id: shared_id,
                description: JSON.stringify(testSharedDescription),
                timestamp: 88888888
            }
        });

        const result = await sync({ user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.putSharedSchedule)).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
})