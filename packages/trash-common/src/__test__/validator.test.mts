import {checkTrashes, existSchedule, generateRandomCode, generateUUID, isNotEmpty, isNotLessMin, isNotOverMax, isNumber, isValidMonthValue, isValidTrashType, isValidTrashVal} from "../validator.mjs";
describe("input check",()=>{
    describe("isNotEmpty",()=>{
        it("string",()=>{
            expect(isNotEmpty("テスト")).toBeTruthy();
        });
        it("Number",()=>{
            expect(isNotEmpty(0)).toBeTruthy();
        });
        it("Empty",()=>{
            expect(isNotEmpty("")).toBeFalsy();
            expect(isNotEmpty(undefined)).toBeFalsy();
        });
    });
    describe("isNumber",()=> {
        it("number",()=>{
            expect(isNumber(0)).toBeTruthy();
        });
        it("string as number",()=>{
            expect(isNumber("0")).toBeTruthy();
        })
        it("string",()=>{
            expect(isNumber("string")).toBeFalsy();
        });
    });
    describe("isNotLessMin",()=>{
        it("not less",()=>{
            expect(isNotLessMin(1,1)).toBeTruthy();
        });
        it("less",()=>{
            expect(!isNotLessMin(0,1)).toBeTruthy();
        });
    });
    describe("isNotOverMax",()=>{
        it("not over",()=>{
            expect(isNotOverMax(1,1)).toBeTruthy();
        });
        it("over",()=>{
            expect(isNotOverMax(2,1)).toBeFalsy();
        });
    });
    describe("isValidMonthValue",()=>{
        it("valid",()=>{
            expect(isValidMonthValue(10)).toBeTruthy();
        });
        it("less",()=>{
            expect(isValidMonthValue(0)).toBeFalsy();
        });
        it("over",()=>{
            expect(isValidMonthValue(32)).toBeFalsy();
        });
        it("string as number",()=>{
            expect(isValidMonthValue("11")).toBeTruthy();
        });
        it("not number",()=>{
            expect(isValidMonthValue("gy7")).toBeFalsy();
        });
    });
    describe("isValidTrashType",()=>{
        it("valid other",()=>{
            expect(isValidTrashType({type: "other",trash_val: "生ゴミ", schedules: []},10)).toBeTruthy();
        });
        it("valid preset",()=>{
            expect(isValidTrashType({type: "burn", trash_val: "", schedules: []},10)).toBeTruthy();
        });
        it("invalid over",()=>{
            expect(isValidTrashType({type: "other",trash_val: "あいうえおかきくけこさ", schedules: []},10)).toBeFalsy();
        });
        it("invalid less",()=>{
            expect(isValidTrashType({type: "other",trash_val: "", schedules: []},10)).toBeFalsy();
        });
        it("invalid undefined",()=>{
            expect(isValidTrashType({type: "other",trash_val: undefined, schedules:[]},10)).toBeFalsy();
        });
    });
    describe("isValidTrashVal",()=>{
        it("valid kanji-kana",()=>{
            expect(isValidTrashVal("今のゴミ")).toBeTruthy();
        });
        it("valid number-alphabet",()=>{
            expect(isValidTrashVal("team32")).toBeTruthy();
        });
        it("invalid mark",()=>{
            expect(isValidTrashVal("te-am32")).toBeFalsy();
        });
        it("invalid empty",()=>{
            expect(isValidTrashVal("")).toBeFalsy();
        });
        it("invalid kana-mark",()=>{
            expect(isValidTrashVal("あいう、えお")).toBeFalsy();
        });
        it("valid blank",()=>{
                expect(isValidTrashVal("bla nk")).toBeTruthy();
        });
    });
    describe("existSchedule",()=>{
        it("exist",()=>{
            expect(existSchedule([{type: "weekday", value: "0"}])).toBeTruthy();
        });
        it("none",()=>{
            expect(existSchedule([{type: "none", value: ""},{type:"weekday",value: "0"}])).toBeFalsy();
        });
        it("empty",()=>{
            expect(existSchedule([])).toBeFalsy();
        });
    });
    describe("checkTrashes",()=>{
        it("valid", ()=>{
            const data = [
                {type: "burn",schedules:[{
                    type: "month",value: "3"
                }]},
                {type: "other", trash_val:"電池",schedules:[{
                    type: "weekday",value: "0"
                }]}
            ];
            expect(checkTrashes(data)).toBeTruthy();
        });
        it("invalid schedules empty", ()=>{
            const data = [
                {type: "burn",schedules:[]},
                {type: "other", trash_val:"電池",schedules:[{
                    type: "weekday",value: "0"
                }]}
            ];
            expect(checkTrashes(data)).toBeFalsy();
        })
        it("invalid none schedules", ()=>{
            const data = [
                {type: "burn", schedules: []},
                {type: "other", trash_val:"電池",schedules:[{
                    type: "weekday",value: "0"
                }]}
            ];
            expect(checkTrashes(data)).toBeFalsy();
        })
        it("invalid other trash_val", ()=>{
            const data = [
                {type: "burn",schedules:[{
                    type: "month",value: "3"
                }]},
                {type: "other", trash_val:"あいうえおかきくけこさ",schedules:[{
                    type: "weekday",value: "0"
                }]}
            ];
            expect(checkTrashes(data)).toBeFalsy();
            data[1].trash_val = "";
            expect(checkTrashes(data)).toBeFalsy();
        });
        it("invalid month val", ()=>{
            const data = [
                {type: "burn",schedules:[{
                    type: "month",value: "0"
                }]},
                {type: "other", trash_val:"電池",schedules:[{
                    type: "weekday",value: "0"
                }]}
            ];
            expect(checkTrashes(data)).toBeFalsy();
        });
        it("invalid global excludes length", () => {
            const data = [
                {type: "burn",schedules:[{
                    type: "month",value: "3"
                }]}
            ];
            const global = Array.from({length: 11}, (_, idx)=>({month: 1, date: idx + 1}));
            expect(checkTrashes(data, global)).toBeFalsy();
        });
        it("invalid global excludes value", () => {
            const data = [
                {type: "burn",schedules:[{
                    type: "month",value: "3"
                }]}
            ];
            expect(checkTrashes(data, [{month: 13, date: 1}])).toBeFalsy();
            expect(checkTrashes(data, [{month: 0, date: 1}])).toBeFalsy();
            expect(checkTrashes(data, [{month: 2, date: 30}])).toBeFalsy();
            expect(checkTrashes(data, [{month: 4, date: 31}])).toBeFalsy();
        });
        it("valid global excludes", () => {
            const data = [
                {type: "burn",schedules:[{
                    type: "month",value: "3"
                }]}
            ];
            expect(checkTrashes(data, [{month: 1, date: 1}])).toBeTruthy();
        });
    })
});
describe("generateUUID",()=> {
    it("separatorナシ", ()=>{
        expect(generateUUID().length).toBe(32);
    });
    it("separatorあり", ()=>{
        expect(generateUUID("-").length).toBe(36);
    });
});
describe("generateRandomCode",()=>{
    it("parameter無し",()=>{
        const result = generateRandomCode();
        console.log(result)
        expect(result.length).toBe(10);
    });
    it("parameterあり",()=>{
        const result = generateRandomCode(8);
        console.log(result)
        expect(result.length).toBe(8);
    });
})
