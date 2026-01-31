import {jest} from "@jest/globals";

const {TextCreator, TrashScheduleService} = await import("../client/client.mjs");
// 副作用を伴わない型情報だけのインポートを行う
import type {RecentTrashDate, DBAdapter} from "../client/client.mjs";
import type {TrashSchedule,TrashTypeValue} from "../types.mjs";
import {getLogger} from "../logger.mjs";

process.env.MecabAPI_URL = "https://example.com";
import testData from "./testdata.json" with { type: "json" };

const logger = getLogger();
logger.setLevel_DEBUG();

class TestDBAdapter implements DBAdapter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserIDByAccessToken(_access_token: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTrashSchedule(_user_id: string): Promise<TrashSchedule> {
        throw new Error("Method not implemented.");
    }
}

describe("en-US",function(){
    it("checkEnableTrashes",async()=>{
        const service = new TrashScheduleService("America/New_York", new TextCreator("en-US"), new TestDBAdapter());
        // Date.UTCのMonthは0始まり
        Date.now = jest.fn().mockReturnValue(Date.UTC(2018,2,1,5,0,0,0) as number) as jest.Mock<typeof Number>;
        const testdata = [{ "type": "burn", "trash_val": "", "schedules": [{ "type": "weekday", "value": "3" }, { "type": "weekday", "value": "6" }, { "type": "none", "value": "" }] }, { "type": "plastic", "trash_val": "", "schedules": [{ "type": "weekday", "value": "1" }, { "type": "none", "value": "" }, { "type": "none", "value": "" }] }, { "type": "paper", "trash_val": "", "schedules": [{ "type": "none", "value": "" }, { "type": "biweek", "value": "1-2" }, { "type": "none", "value": "" }] }, { "type": "plastic", "trash_val": "", "schedules": [{ "type": "weekday", "value": "4" }, { "type": "none", "value": "" }, { "type": "none", "value": "" }] }, { "type": "petbottle", "trash_val": "", "schedules": [{ "type": "weekday", "value": "4" }, { "type": "month", "value": "11" }, { "type": "none", "value": "" }] }];

        const result = await service.checkEnableTrashes(testdata,0);
        expect(result.length).toBe(2);
        expect((result as TrashTypeValue[])[0].name).toBe("plastic");
        expect((result as TrashTypeValue[])[1].name).toBe("plastic bottle");
    });
});

describe("calculateLocalTime",()=>{
    beforeAll(()=>{
        Date.now = jest.fn().mockReturnValue(1554298037605) as jest.Mock<typeof Number>;
    });
    it("calculateTime",()=>{
        let dt;
        let service = new TrashScheduleService("America/Denver", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(7);

        service = new TrashScheduleService("America/Boise", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(7);

        service = new TrashScheduleService("America/Phoenix", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(6);

        service = new TrashScheduleService("America/Los_Angeles", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(6);

        service = new TrashScheduleService("America/Chicago", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(8);

        service = new TrashScheduleService("America/Indiana/Indianapolis", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(9);

        service = new TrashScheduleService("America/Detroit", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(9);

        service = new TrashScheduleService("America/New_York", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(9);

        service = new TrashScheduleService("America/Anchorage", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(5);

        service = new TrashScheduleService("Pacific/Honolulu", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(3);


        service = new TrashScheduleService("Asia/Tokyo", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(22);


        service = new TrashScheduleService("utc", new TextCreator("en-US"),new TestDBAdapter());
        dt = service.calculateLocalTime(0);
        expect(dt.getHours()).toBe(13);
    });
});

describe("ja-JP",function(){
    const service = new TrashScheduleService("Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let world_time_api_data: any;
    beforeAll(async()=>{
        // 固定の時刻を使用(外部API呼び出しを避けるため)
        const fixedTime = new Date().getTime();
        world_time_api_data = {
            unixtime: Math.floor(fixedTime / 1000)
        };
        Date.now = jest.fn().mockReturnValue(fixedTime) as jest.Mock<typeof Number>;
    });
    describe("calculateLocalTime",function(){
        it("今日の日付",function(){
            const ans = new Date(world_time_api_data.unixtime * 1000 + (9*60*60*1000));
            const dt:Date = service.calculateLocalTime(0);
            expect(dt.getDate()).toBe(ans.getUTCDate());
            expect(dt.getDay()).toBe(ans.getUTCDay());
        });

        it("明日の日付",function(){
            const ans = new Date(world_time_api_data.unixtime * 1000 + (9*60*60*1000));
            ans.setSeconds(ans.getSeconds()+(24*60*60));
            const dt = service.calculateLocalTime(1);
            expect(dt.getDate()).toBe(ans.getUTCDate());
            expect(dt.getDay()).toBe(ans.getUTCDay());
        });
    });

    describe("checkEnableTrashes",function(){
        it("weekday",async()=>{
            Date.now = jest.fn().mockReturnValue(Date.UTC(2018,1,28,15,0,0,0)) as jest.Mock<typeof Number>;
            const result = await service.checkEnableTrashes(testData.checkEnableTrashes,0) as TrashTypeValue[];
            expect(result.length).toBe(2);
            expect(result[0].name).toBe("資源ゴミ");
            expect(result[1].name).toBe("ペットボトル");

        });
        it("biweek",async()=>{
            Date.now = jest.fn().mockReturnValue(Date.UTC(2018,2,11,15,0,0,0)) as jest.Mock<typeof Number>;
            const result = await service.checkEnableTrashes(testData.checkEnableTrashes, 0) as TrashTypeValue[];
            expect(result.length).toBe(2);
            expect(result[0].name).toBe("プラスチック");
            expect(result[1].name).toBe("古紙");
        });
        it("month",async()=>{
            Date.now = jest.fn().mockReturnValue(Date.UTC(2018,2,10,15,0,0,0)) as jest.Mock<typeof Number>;
            const result = await service.checkEnableTrashes(testData.checkEnableTrashes, 0) as TrashTypeValue[];
            expect(result.length).toBe(1);
            expect(result[0].name).toBe("ペットボトル");
        });
        describe("evweek",()=>{
            it("evweek",async()=>{
                console.log("Evweek of interval 2");
                Date.now = jest.fn().mockReturnValue(Date.UTC(2018,8,25,15,0,0,0)) as jest.Mock<typeof Number>;

                /**
                 * テストデータの想定(testdata.jsonのevweek)
                 * 1.曜日が一致し該当週のため対象
                 * 2.曜日が一致し該当週のため対象(年をまたいだ隔週判定)
                 * 3.該当集だが曜日が一致しないので対象外
                 * 4.登録週=今週かつ曜日が一致のため対象
                 * 5.翌週が該当週のため対象外
                 * 6.前週が該当のため対象外
                 * 7.4週間前のため一致
                 */
                const result = await service.checkEnableTrashes(testData.evweek, 0) as TrashTypeValue[];
                expect(result.length).toBe(4);
                expect(result[0].name).toBe("もえるゴミ");
                expect(result[1].name).toBe("もえないゴミ");
                expect(result[2].name).toBe("プラスチック");
                expect(result[3].name).toBe("ビン");

            });
            it("interval3",async()=>{

                Date.now = jest.fn().mockReturnValue(Date.UTC(2020,8,29,15,0,0,0)) as jest.Mock<typeof Number>;

                /**
                 * テストデータの想定(testdata.jsonのevweek)
                 * 1.曜日が一致し該当週のため対象
                 * 2.曜日が一致し該当週のため対象(年をまたいだ隔週判定)
                 * 3.該当集だが曜日が一致しないので対象外
                 * 4.登録週=今週かつ曜日が一致のため対象
                 * 5.翌週が該当週のため対象外
                 * 6.前週が該当のため対象外
                 * 7.6週間前のため一致
                 */
                const result = await service.checkEnableTrashes(testData.evweekInterval3, 0) as TrashTypeValue[];
                expect(result.length).toBe(4);
                expect(result[0].name).toBe("もえるゴミ");
                expect(result[1].name).toBe("もえないゴミ");
                expect(result[2].name).toBe("プラスチック");
                expect(result[3].name).toBe("ビン");
            });
            it("interval4",async()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2020,8,29,15,0,0,0)) as jest.Mock<typeof Number>;

                /**
                * テストデータの想定(testdata.jsonのevweek)
                * 1.曜日が一致し該当週のため対象
                * 2.曜日が一致し該当週のため対象(年をまたいだ隔週判定)
                * 3.該当集だが曜日が一致しないので対象外
                * 4.登録週=今週かつ曜日が一致のため対象
                * 5.翌週が該当週のため対象外
                * 6.前週が該当のため対象外
                * 7.8週間前のため一致
                */
                const result = await service.checkEnableTrashes(testData.evweekInterval4, 0) as TrashTypeValue[];
                expect(result.length).toBe(4);
                expect(result[0].name).toBe("もえるゴミ");
                expect(result[1].name).toBe("もえないゴミ");
                expect(result[2].name).toBe("プラスチック");
                expect(result[3].name).toBe("ビン");
            });
            it("noneInterval",async()=>{

                Date.now = jest.fn().mockReturnValue(Date.UTC(2020,8,29,15,0,0,0)) as jest.Mock<typeof Number>;

                /**
                * インターバルを持たない隔週データ（機能追加前）
                */
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const result = await service.checkEnableTrashes(testData.evweekNoneInterval, 0) as TrashTypeValue[];
                expect(result.length).toBe(1);
                expect(result[0].name).toBe("もえるゴミ");
            })
            it("none",async()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2018,2,3,15,0,0,0)) as jest.Mock<typeof Number>;

                const result = await service.checkEnableTrashes(testData.checkEnableTrashes,0);
                expect(result.length).toBe(0);
            });
        });
        it("例外日が設定されている場合",async()=>{
            // ペットボトルが該当するが、例外日1/29が設定されているため対象外
            Date.now = jest.fn().mockReturnValue(Date.UTC(2018,1,21,15,0,0,0)) as jest.Mock<typeof Number>;
            const result = await service.checkEnableTrashes(testData.checkEnableTrashes,0) as TrashTypeValue[];
            expect(result.length).toBe(1);
            expect(result[0].name).toBe("資源ゴミ");
        });
    });
    describe("checkEnableTrashes duplicate 重複排除機能",function(){
        it("重複の排除",async()=>{
            Date.now = jest.fn().mockReturnValue(Date.UTC(2018,8,28,15,0,0,0)) as jest.Mock<typeof Number>;

            const response = await service.checkEnableTrashes(testData.duplicate,0);
            expect(response.length).toBe(1);
        });
        it("otherの場合はtrash_valが同じ場合のみ重複排除",async()=>{
            Date.now = jest.fn().mockReturnValue(Date.UTC(2018,7,25,15,0,0,0)) as jest.Mock<typeof Number>;

            const response = await service.checkEnableTrashes(testData.duplicate_other,0) as TrashTypeValue[];
            expect(response.length).toBe(2);
            expect(response[0].name).toBe("廃品");
            expect(response[1].name).toBe("発泡スチロール");
        });
    });
    describe("getTargetDayByWeekday",function(){
        beforeAll(()=>{
            Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,16,15,0,0,0)) as jest.Mock<typeof Number>;
        });
        it("日曜日",function(){
            const target_day = service.getTargetDayByWeekday(0);
            expect(target_day).toBe(7);
        });
        it("月曜日",function(){
            const target_day = service.getTargetDayByWeekday(1);
            expect(target_day).toBe(1);
        });
        it("土曜日",function(){
            const target_day = service.getTargetDayByWeekday(6);
            expect(target_day).toBe(6);
        });
    });

    describe("calculateNextDayBySchedule",()=>{
        const today = new Date("2019/11/27"); //水曜日
        describe("weekday",()=>{
            it("weekday:当日",()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "weekday", "3", []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(27);
            });
            it("weekday:同じ週",()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "weekday", "6", [{month: 11, date: 28}]);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(30);
            });
            it("weekday:次の週",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019//11/20"), "weekday", "2", []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(26);
            });
            it("weekday:月替り",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019//11/27"), "weekday", "2", []);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(3);
            });
            it("weekday:例外日に該当", ()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "weekday", "6", [{month: 11, date: 29},{month: 11, date: 30}]);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(7);
            })
            it("2026/01/01が例外日の場合", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2025/12/30"), "weekday", "4", [{month: 1, date: 1}]);
                expect(next_dt.getFullYear()).toBe(2026);
                expect(next_dt.getMonth()+1).toBe(1);
                expect(next_dt.getDate()).toBe(8);
            });

        });
        describe("month", ()=>{
            it("month:当日",()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "month", "27",[]);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(27);
            });
            it("month:同じ月",()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "month", "29", []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(29);
            });
            it("month:月替り1日",()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "month", "1", []);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(1);
            });
            it("month:月替り",()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "month", "4", []);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(4);
            });
            it("month:例外日に該当",()=>{
                const next_dt = service.calculateNextDateBySchedule(today, "month", "29", [{month: 11, date: 29}]);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(29);
            });
        });
        describe("biweek",()=>{
            it("biweek:当日",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/22"), "biweek", "5-4", [{month: 11, date:23}]);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(22);

            });
            it("biweek:同じ週",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/22"), "biweek", "6-4", []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(23);
            });
            it("biweek:次の週",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/22"), "biweek", "0-4", []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(24);
            });
            it("biweek月替り",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/22"), "biweek", "0-1", []);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(1);
            });
            it("biweek:例外日に該当",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/22"), "biweek", "0-4", [{month: 11, date:22},{month: 11, date:24}]);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(22);
            });
        });
        describe("evweek",()=>{
            it("インターバル2:当日", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/22"), "evweek", {start: "2019-11-17",weekday: "5", interval: 2}, []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(22);
            })
            it("インターバル2:同じ週", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/21"), "evweek", {start: "2019-11-3",weekday: "5", interval: 2}, []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(22);
            });
            it("インターバル2:次の週", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/21"), "evweek", {start: "2019-11-10",weekday: "5", interval: 2}, []);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(29);
            });
            it("インターバル2:開始が未来日", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/21"), "evweek", {start: "2019-11-24",weekday: "5", interval: 2}, [{month: 11, date: 30},{month: 12, date:29}]);
                expect(next_dt.getMonth()+1).toBe(11);
                expect(next_dt.getDate()).toBe(29);
            });
            it("インターバル2:月跨ぎ", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/21"), "evweek", {start: "2019-11-17",weekday: "1", interval: 2}, []);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(2);
            });
            it("インターバル2:スタート週の翌月", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/12/11"), "evweek", {start: "2019-11-17",weekday: "1", interval: 2}, []);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(16);
            });
            it("インターバル2:スタート週の翌々月", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/12/11"), "evweek", {start: "2019-10-27",weekday: "1", interval: 2}, []);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(23);
            });
            it("インターバル2:例外日に該当", ()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/21"), "evweek", {start: "2019-11-24",weekday: "5", interval: 2}, [{month: 11, date: 30},{month: 11, date:29}]);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(13);
            });
            it("インターバルなし",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/21"), "evweek", {start: "2019-11-17",weekday: "1"}, [{month: 10, date: 22}]);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(2);
            });
            it("インターバルなし:例外日に該当",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2019/11/21"), "evweek", {start: "2019-11-17",weekday: "1"}, [{month: 12, date: 2}]);
                expect(next_dt.getMonth()+1).toBe(12);
                expect(next_dt.getDate()).toBe(16);
            });
            it("インターバル3",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2020/09/30"), "evweek", {start: "2020-09-06",weekday: "4",interval:3}, []);
                expect(next_dt.getMonth()+1).toBe(10);
                expect(next_dt.getDate()).toBe(1);
            });
            it("インターバル3:開始日の翌々月",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2020/09/30"), "evweek", {start: "2020-07-26",weekday: "4",interval:3}, []);
                expect(next_dt.getMonth()+1).toBe(10);
                expect(next_dt.getDate()).toBe(1);
            });
            it("インターバル3:例外日に該当",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2020/09/30"), "evweek", {start: "2020-07-26",weekday: "4",interval:3}, [{month: 10, date: 1}]);
                expect(next_dt.getMonth()+1).toBe(10);
                expect(next_dt.getDate()).toBe(22);
            });
            it("インターバル4",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2020/09/30"), "evweek", {start: "2020-08-30",weekday: "4",interval:4}, []);
                expect(next_dt.getMonth()+1).toBe(10);
                expect(next_dt.getDate()).toBe(1);
            }),
            it("インターバル4:例外日に該当",()=>{
                const next_dt = service.calculateNextDateBySchedule(new Date("2020/09/30"), "evweek", {start: "2020-07-05",weekday: "4",interval:4}, [{month: 10, date: 1}]);
                expect(next_dt.getMonth()+1).toBe(10);
                expect(next_dt.getDate()).toBe(29);
            })
        });
    })

    describe("getDayByTrashType",()=>{
        describe("weekday",()=>{
            const trashes = [
                {
                    type: "burn",
                    schedules: [
                        {type:"weekday",value: "0"},
                        {type:"weekday",value: "6"},
                    ]
                }
            ];
            it("当日が日曜日",()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,16,15,0,0,0)) as jest.Mock<typeof Number>;
                const result: RecentTrashDate[] = service.getDayByTrashType(trashes,"burn");
                console.log(JSON.stringify(result,null,2));
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(17);
                expect(result[0].list[1].getMonth()+1).toBe(3);
                expect(result[0].list[1].getDate()).toBe(23);
                expect(result[0].recent.getDate()).toBe(17);
            });
            it("当日が金曜日",()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,14,15,0,0,0)) as jest.Mock<typeof Number>;
                const result = service.getDayByTrashType(trashes,"burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(17);
                expect(result[0].list[1].getMonth()+1).toBe(3);
                expect(result[0].list[1].getDate()).toBe(16);
                expect(result[0].recent.getDate()).toBe(16);
            });
        });
        describe("month",()=>{
            beforeAll(()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2019,1,14,15,0,0,0)) as jest.Mock<typeof Number>;
            });
            it("翌月1日設定/同月追加/同月追加後の翌月/同日",()=>{
                const trashes = [
                    {
                        type: "burn",
                        schedules: [
                            {type: "month",value: "1"},
                            {type: "month",value: "17"},
                            {type: "month",value: "31"},
                            {type: "month",value: "15"}
                        ]
                    }
                ];
                const result = service.getDayByTrashType(trashes,"burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[1].getMonth()+1).toBe(2);
                expect(result[0].list[2].getMonth()+1).toBe(3);
                expect(result[0].list[3].getMonth()+1).toBe(2);
                expect(result[0].recent.getDate()).toBe(15);
            });
        });
        describe("biweek",()=>{
            it("第n曜日が一致する日にちでの計算",()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,12,15,0,0,0)) as jest.Mock<typeof Number>;
                const trashes = [
                    {
                        type: "burn",
                        schedules: [
                            { type: "biweek", value: "3-2" }, //当日
                            { type: "biweek", value: "3-3" }, //1週間後
                            { type: "biweek", value: "4-2" }, //同じ週の後ろの曜日
                            { type: "biweek", value: "4-3" }, //1週間後の後ろの曜日
                            { type: "biweek", value: "2-3" }, //1週間後の前の曜日
                            { type: "biweek", value: "1-1" }  //翌月
                        ]
                    }
                ];
                const result = service.getDayByTrashType(trashes, "burn");
                expect(result[0].list[0].getDate()).toBe(13);
                expect(result[0].list[1].getDate()).toBe(20);
                expect(result[0].list[2].getDate()).toBe(14);
                expect(result[0].list[3].getDate()).toBe(21);
                expect(result[0].list[4].getDate()).toBe(19);
                expect(`${result[0].list[5].getMonth() + 1}-${result[0].list[5].getDate()}`).toBe("4-1");
                expect(result[0].recent.getDate()).toBe(13);
            });
            it("同じ週に第n曜日が一致しない後ろの曜日での計算",()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,12,15,0,0,0)) as jest.Mock<typeof Number>;
                const trashes = [
                    {
                        type: "burn",
                        schedules: [
                            { type: "biweek", value: "5-3" }, //同じ週で回数が多い曜日
                            { type: "biweek", value: "5-4" }, //1週間後で回数が多い曜日
                            { type: "biweek", value: "5-2" }  //回数が既に終わっている曜日
                        ]
                    }
                ];
                const result = service.getDayByTrashType(trashes, "burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(15);
                expect(result[0].list[1].getMonth()+1).toBe(3);
                expect(result[0].list[1].getDate()).toBe(22);
                expect(`${result[0].list[2].getMonth() + 1}-${result[0].list[2].getDate()}`).toBe("4-12");
                expect(result[0].recent.getDate()).toBe(15);
            });
            it("同じ週に第n曜日が一致しない前の曜日での計算",()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,14,15,0,0,0)) as jest.Mock<typeof Number>;
                const trashes = [
                    {
                        type: "burn",
                        schedules: [
                            { type: "biweek", value: "4-3" }, //1週間後で回数が少ない曜日
                        ]
                    }
                ];
                const result = service.getDayByTrashType(trashes, "burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(21);
                expect(result[0].recent.getDate()).toBe(21);
            });
        });
        describe("evweek",()=>{
            beforeAll(()=>{
                Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,14,15,0,0,0)) as jest.Mock<typeof Number>;
            });
            it("インターバル2",()=>{
                const trashes = [
                    {
                        type: "burn",
                        schedules: [
                            {type: "evweek",value:{weekday: "6",start:"2019-02-24", interval: 2}}, // 今週の土曜日に該当
                            {type: "evweek",value:{weekday: "6",start:"2019-03-03", interval: 2}}, // 翌週の土曜日に該当
                            {type: "evweek",value:{weekday: "5",start:"2019-03-10", interval: 2}}  // 当日(金曜日)に該当
                        ]
                    }
                ];

                const result = service.getDayByTrashType(trashes,"burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(16);
                expect(result[0].list[1].getMonth()+1).toBe(3);
                expect(result[0].list[1].getDate()).toBe(23);
                expect(result[0].list[2].getMonth()+1).toBe(3);
                expect(result[0].list[2].getDate()).toBe(15);
                expect(result[0].recent.getDate()).toBe(15);
            });
            it("インターバル2: 開始週の翌月",()=>{
                const custom_trashes = [
                    {
                        type: "burn",
                        schedules: [
                            {type: "evweek",value:{weekday: "6",start:"2019-01-13", interval: 2}},
                            {type: "weekday",value: "0"}
                        ]
                    }
                ];
                const result = service.getDayByTrashType(custom_trashes,"burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(16);
                expect(result[0].list[1].getMonth()+1).toBe(3);
                expect(result[0].list[1].getDate()).toBe(17);
                expect(result[0].recent.getDate()).toBe(16);
            });
            it("インターバル2: 開始週の翌々月",()=>{
                const custom_trashes = [
                    {
                        type: "burn",
                        schedules: [
                            {type: "evweek",value:{weekday: "6",start:"2018-12-30", interval: 2}},
                        ]
                    }
                ];
                const result = service.getDayByTrashType(custom_trashes,"burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(16);
                expect(result[0].recent.getDate()).toBe(16);
            });
            it("インターバル3",()=>{
                const trashes = [
                    {
                        type: "burn",
                        schedules: [
                            {type: "evweek",value:{weekday: "6",start:"2019-02-24", interval: 3}},
                            {type: "evweek",value:{weekday: "6",start:"2019-03-03", interval: 3}},
                            {type: "evweek",value:{weekday: "6",start:"2019-03-10", interval: 3}},
                        ]
                    }
                ];
                const result = service.getDayByTrashType(trashes,"burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(23);
                expect(result[0].list[1].getMonth()+1).toBe(3);
                expect(result[0].list[1].getDate()).toBe(30);
                expect(result[0].list[2].getMonth()+1).toBe(3);
                expect(result[0].list[2].getDate()).toBe(16);
                expect(result[0].recent.getDate()).toBe(16);
            }),
            it("インターバル4",()=>{
                const trashes = [
                    {
                        type: "burn",
                        schedules: [
                            {type: "evweek",value:{weekday: "6",start:"2019-02-24", interval: 4}},
                            {type: "evweek",value:{weekday: "6",start:"2019-03-03", interval: 4}},
                            {type: "evweek",value:{weekday: "6",start:"2019-03-10", interval: 4}},
                        ]
                    }
                ];
                const result = service.getDayByTrashType(trashes,"burn");
                expect(result[0].list[0].getMonth()+1).toBe(3);
                expect(result[0].list[0].getDate()).toBe(30);
                expect(result[0].list[1].getMonth()+1).toBe(4);
                expect(result[0].list[1].getDate()).toBe(6);
                expect(result[0].list[2].getMonth()+1).toBe(3);
                expect(result[0].list[2].getDate()).toBe(16);
                expect(result[0].recent.getDate()).toBe(16);
            })
        });
    });
    describe("nomatch",()=>{
        it("該当するごみが登録されていない",()=>{
            const trashes = [
                {
                    type: "burn",
                    schedules: [{type: "weekday",value:"0"}]
                }
            ];
            const result = service.getDayByTrashType(trashes,"unburn");
            expect(result.length).toBe(0);
        });
    });
    describe("other match",()=>{
        beforeAll(()=>{
            Date.now = jest.fn().mockReturnValue(Date.UTC(2019,2,14,15,0,0,0)) as jest.Mock<typeof Number>;
        });
        it("複数のother登録",()=>{
            const trashes = [
                { type: "other", trash_val: "金属", schedules: [{type: "weekday",value:"5"},{type: "month",value:"30"}] },
                { type: "other", trash_val: "リソース", schedules: [{type: "weekday",value:"5"},{type: "month",value:"30"}] }
            ];
            const result = service.getDayByTrashType(trashes,"other");
            console.log(result);
            expect(result[0].list.length).toBe(2);
            expect(result[0].key).toBe("金属");
            expect(result[0].list[0].getDate()).toBe(15);
            expect(result[0].recent.getDate()).toBe(15);
            expect(result[1].list.length).toBe(2);
            expect(result[1].key).toBe("リソース");
            expect(result[1].list[0].getDate()).toBe(15);
            expect(result[1].recent.getDate()).toBe(15);
        });
    });
});

describe("getRemindBody",()=>{
    const client = new TrashScheduleService("Asia/Tokyo",new TextCreator("ja-JP"),new TestDBAdapter());
    describe("thisweek", ()=>{
        it("sunday", async()=>{
            Date.now = jest.fn().mockReturnValue(1564892787630) as jest.Mock<typeof Number>; //2019/8/4
            const result_list = await client.getRemindBody(0, testData.reminder);
            expect(result_list.length).toBe(6);
            expect(result_list[2].body[0]!.type).toBe("burn");
            expect(result_list[5].body[0]!.type).toBe("other");
        });
        it("saturday", async()=>{
            Date.now = jest.fn().mockReturnValue(1565362800000) as jest.Mock<typeof Number>; //2019/8/10
            const result_list = await client.getRemindBody(0, testData.reminder);
            expect(result_list.length).toBe(0);
        });
    });
    describe("nextweek", ()=>{
        it("sunday", async()=>{
            Date.now = jest.fn().mockReturnValue(1564892787630) as jest.Mock<typeof Number>; //2019/8/4
            const result_list = await client.getRemindBody(1, testData.reminder);
            expect(result_list.length).toBe(7)
            expect(result_list[0].body[0]!.type).toBe("burn");
            expect(result_list[0].body[1]!.type).toBe("can");
            expect(result_list[3].body[0]!.type).toBe("burn");
            expect(result_list[6].body.length).toBe(0);
        });
        it("saturday",async()=>{
            Date.now = jest.fn().mockReturnValue(1565362800000) as jest.Mock<typeof Number>; //2019/8/10
            const result_list = await client.getRemindBody(1, testData.reminder);
            expect(result_list.length).toBe(7);
            expect(result_list[0].body[0]!.type).toBe("burn");
            expect(result_list[0].body[1]!.type).toBe("can");
            expect(result_list[3].body[0]!.type).toBe("burn");
            expect(result_list[6].body.length).toBe(0);
        });
    })
});

describe("getTrashData", function () {
    const access_token_001 = "abcd989049AsdjfdALJD0j-sdfadshfF";
    const id_001 = "10b38bbe-8a0f-4afc-afa9-c00aaac1d1de";

    // 存在しないアクセストークン
    const access_token_002 = "bbbbbbbbb";

    // 旧型のアクセストークン
    const access_token_003 = "10b38bbe-8a0f-4afc-afa9-c00aaac1d1df";

    // 存在しないuser_idを返すアクセストークン
    const access_token_004 = "fc-afa9-c00aaac1d1df";

    // 存在しないuser_id
    const id_002 = "20b38bbe-8a0f-4afc-afa9-c00aaac1d1df";

    // DB異常を起こすIDのアクセストークン
    const access_token_005 = "aaaaaaaaaaaabbbbd";
    const access_token_006 = "merge-global-exclude";
    const id_003 = "30b38bbe-8a0f-4afc-afa9-c00aaac1d1df";


    class TestDBAdapter implements DBAdapter {
        getUserIDByAccessToken(access_token: string): Promise<string> {
            if(access_token === access_token_001) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve(id_001)});
            }  else if(access_token === access_token_002) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve("")});
            } else if(access_token === access_token_004) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve(id_002)});
            } else if(access_token === access_token_005) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve("failed_id")});
            } else if(access_token === access_token_006) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve(id_003)});
            }
            throw new Error("Method not implemented.");
        }
        getTrashSchedule(user_id: string): Promise<TrashSchedule> {
            if(user_id === id_001 || user_id === access_token_003) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve({trashData: testData.evweek,checkedNextday: false})});
            } else if(user_id === id_003) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve({
                    trashData: [{ type: "burn", schedules: [{ type: "weekday", value: "1" }], excludes: [] }],
                    checkedNextday: true,
                    globalExcludes: [{ month: 1, date: 2 }]
                })});
            } else if(user_id === id_002) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                return new Promise((resolve,_reject)=>{resolve({trashData: [], checkedNextday: true})});
            }
            throw new Error("Method not implemented.");
        }
    }

    const service = new TrashScheduleService("Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter());
    it("正常データ", async()=>{
            const result = await service.getTrashData(access_token_001);
            expect(result.status).toBe("success");
            expect(result.response).toMatchObject(testData.evweek);
    });
    it("正常データ（旧タイプ）", async()=>{
        // 生アクセストークンが36桁の場合はそのままTrashScheduleを検索する
        const result = await service.getTrashData(access_token_003);
        expect(result.status).toBe("success");
        expect(result.response).toMatchObject(testData.evweek);
    });
    it("存在しないアクセストークン", async()=> {
        const result = await service.getTrashData(access_token_002);
        expect(result.status).toBe("error");
        expect(result.msgId).toBe("ERROR_ID_NOT_FOUND");
    });
    it("存在しないID", async()=> {
        const result = await service.getTrashData(access_token_004);
        expect(result.status).toBe("error");
        expect(result.msgId).toBe("ERROR_ID_NOT_FOUND");
    });
    it("アクセストークン取得でDB異常", async()=> {
        const result = await service.getTrashData("failed_token");
        expect(result.status).toBe("error");
        expect(result.msgId).toBe("ERROR_GENERAL");
    });
    it("スケジュール取得でDB異常", async()=> {
        const result = await service.getTrashData(access_token_005);
        expect(result.status).toBe("error");
        expect(result.msgId).toBe("ERROR_GENERAL");
    });
    it("全体例外日がマージされる", async()=> {
        const result = await service.getTrashData(access_token_006);
        expect(result.status).toBe("success");
        expect(result.response![0].excludes).toEqual([{ month: 1, date: 2 }]);
    });
});
