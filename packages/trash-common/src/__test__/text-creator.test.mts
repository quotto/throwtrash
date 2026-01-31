import type { LocaleText } from "../client/client.mjs";
import {TextCreator} from "../client/client.mjs"

describe("TextCreator",()=>{
    it("getMessage",()=>{
        const tc = new TextCreator("ja-JP");
        expect(tc.getMessage("ERROR_GENERAL")).toBe("情報の取得に失敗しました。開発者にお問い合わせください。")
        const obj: {message: keyof LocaleText} = {
            message: "REMINDER_WEEK"
        }
        expect(tc.getMessage(obj.message)).toBe("今週と来週、どちらのリマインダーを設定しますか？")
    })
    it("登録情報出力",()=>{
        const tc = new TextCreator("ja-JP");
        const result = tc.getAllSchedule([{type: "burn",schedules:[{type: "weekday", value: "0"},{type: "month", value: "4"}], excludes: [{month: 3, date: 3}]},
            {type: "other", trash_val: "生ごみ", schedules:[{type: "biweek", value: "1-3"},{type: "evweek", value: {weekday: "3", interval: 3, start: "2020-05-05"}}], excludes: [{month: 3, date: 3}]}]
        )
        expect(JSON.stringify(result[0])).toBe(JSON.stringify({type: "burn", typeText: "もえるゴミ",schedules: ["毎週日曜日","毎月4日"]}));
        expect(JSON.stringify(result[1])).toBe(JSON.stringify({type: "other", typeText: "生ごみ",schedules: ["第3月曜日","3週に1度の水曜日"]}));
    })
})