/* eslint-disable no-unused-vars */
import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common"
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

jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import activate from "../activate";
import { ActivationCodeItem, SharedScheduleItem } from "../interface";

describe("activate_test",()=>{
    beforeEach(()=>{
        jest.mocked(dbadapter.getActivationCode).mockImplementation(async(code:string): Promise<ActivationCodeItem | null>=>{
           return {
                code: code,
                shared_id: "share001",
                TTL: 123456
           }
        })
        jest.mocked(dbadapter.setSharedIdToTrashSchedule).mockImplementation(async(user_id: string, shared_id: string): Promise<boolean> =>true);
        jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementation(async(shared_id: string): Promise<SharedScheduleItem | null> =>{
            return {
                shared_id: shared_id,
                description: JSON.stringify(mockData001),
                timestamp: 123456
            }
        });
        jest.mocked(dbadapter.updateTrashSchedule).mockImplementation(async(user_id: string, description: string, timestamp: number): Promise<boolean> => true);
        jest.mocked(dbadapter.deleteActivationCode).mockImplementation(async(code:string)=>true);
    });
    afterEach(()=>{
        jest.resetAllMocks();
    });
    it("正常にゴミ捨てスケジュールが取得される",async()=>{
        const result = await activate({ code: "code001", user_id:"id001" }) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.getActivationCode)).toBeCalledWith("code001");
        expect(jest.mocked(dbadapter.setSharedIdToTrashSchedule)).toBeCalledWith("id001", "share001");
        expect(jest.mocked(dbadapter.getSharedScheduleBySharedId)).toBeCalledWith("share001");
        expect(jest.mocked(dbadapter.updateTrashSchedule)).toBeCalledWith("id001", JSON.stringify(mockData001), 123456);
        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body!);
        expect(body.description).toBe(JSON.stringify(mockData001));
        expect(body.timestamp).toBe(123456)
    });
    it("shared_idの設定に失敗した場合はサーバーエラー", async()=>{
        jest.mocked(dbadapter.setSharedIdToTrashSchedule).mockImplementationOnce(async(user_id: string, shared_id: string)=>false);

        const result = await activate({ code: "code001", user_id:"id001" }) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.setSharedIdToTrashSchedule)).toBeCalled();
        expect(result.statusCode).toBe(500);
    })
    it("SharedScheduleItemの取得に失敗した場合はサーバーエラー", async()=>{
        jest.mocked(dbadapter.getSharedScheduleBySharedId).mockImplementationOnce(async(shared_id: string)=>null);

        const result = await activate({ code: "code001", user_id:"id001" }) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.setSharedIdToTrashSchedule)).toBeCalled();
        expect(jest.mocked(dbadapter.getSharedScheduleBySharedId)).toBeCalled();
        expect(result.statusCode).toBe(500);
    });
    it("TrashScheduleの更更新失敗した場合はサーバーエラー",async()=>{
        jest.mocked(dbadapter.updateTrashSchedule).mockImplementationOnce(async(user_id: string, description: string, timestamp: number): Promise<boolean> => false);

        const result = await activate({ code: "code001", user_id:"id001" }) as APIGatewayProxyStructuredResultV2;
        expect(jest.mocked(dbadapter.getActivationCode)).toBeCalled();
        expect(jest.mocked(dbadapter.setSharedIdToTrashSchedule)).toBeCalled();
        expect(jest.mocked(dbadapter.getSharedScheduleBySharedId)).toBeCalled();
        expect(jest.mocked(dbadapter.updateTrashSchedule)).toBeCalled();
        expect(result.statusCode).toBe(500);
    })
    it("アクティベーションコードがパラメータに無い場合はユーザーエラー",async()=>{
        const result = await activate({user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("ユーザーIDがパラメータ無い場合はユーザエラー",async()=>{
        const result = await activate({code: "code001"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("指定したアアクティベーショコードがDB上に見つからない場合はユーザーエラー",async()=>{
        jest.mocked(dbadapter.getActivationCode).mockImplementationOnce(async(code: string)=>null);
        const result = await activate({code: "code002", user_id: "id001"}) as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
})