/* eslint-disable no-unused-vars */

import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import * as common from "trash-common";
const logger = common.getLogger();
logger.setLevel_DEBUG();

const data001 = [
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

const mockId = "1234567891";
jest.spyOn(common, "generateUUID").mockImplementation((separator)=>mockId);

jest.mock("../dbadapter");
import dbadapter from "../dbadapter";
import { TrashScheduleItem } from "../interface";
import register from "../register";

describe("register",()=>{
    it("正常終了",async()=>{
        const mockedInsertTrashSchedule = jest.mocked(dbadapter.insertTrashSchedule).mockImplementation(async (_: TrashScheduleItem, timestamp) => { return true });
        const result = await register("{\"platform\": \"android\"}") as APIGatewayProxyStructuredResultV2;
        const body = JSON.parse(result.body!);
        expect(result.statusCode).toBe(200);
        expect(body.id.length).toBeGreaterThan(0);

        expect(mockedInsertTrashSchedule).toBeCalledWith(expect.objectContaining({
            id: expect.any(String),
            description: JSON.stringify({ trashData: [], globalExcludes: [] }),
            platform: "android",
        }), expect.any(Number));
    });
    it("platformの指定が無い場合はユーザーエラー",async()=>{
        const result = await register("{}") as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("platformが空の場合はユーザーエラー",async()=>{
        const result = await register("{\"platform\": \"\"}") as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });
    it("JSONのSyntaxエラーの場合はユーザーエラー", async () => {
        const result = await register("platform") as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(400);
    });

    it("DB登録異常の場合はサーバエラー",async()=>{
        jest.mocked(dbadapter.insertTrashSchedule).mockImplementation(async (_: TrashScheduleItem, timestamp) => { return false });
        const result = await register("{\"platform\": \"error\"}") as APIGatewayProxyStructuredResultV2;
        expect(result.statusCode).toBe(500);
    });
});
