import {encode} from "@msgpack/msgpack"



// 副作用を伴わない型情報だけのインポートを行う
import type { CompareApiResult, DBAdapter } from "../client/client.mjs";
// 副作用を伴うインポートはjest.unstable_mockModuleの後にtop-level awaitを使って動的importする
const { TextCreator, TrashScheduleService } = await import("../client/client.mjs");

process.env.MecabAPI_URL = "https://example.com";

class TestDBAdapter implements DBAdapter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUserIDByAccessToken(_access_token: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTrashSchedule(_user_id: string): Promise<import("../index.mjs").TrashSchedule> {
        throw new Error("Method not implemented.");
    }
}

describe("compareTwoText",()=>{
    const service = new TrashScheduleService(
        "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter(),{url: "https://example.com", api_key: "test"});
    beforeEach(()=>{
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
            return {
                status: 200,
                headers: new Headers(),
                ok: true,
                redirected: false,
                statusText: "OK",
                type: "basic",
                url: "",
                body: null,
                bodyUsed: false,
                json: async () => {},
                text: async () => {
                    const value = Buffer.from(encode([{
                        match: "資源ごみ",
                        score: 1.0
                    }])).toString("base64");
                    return value;
                },
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
                clone: () => new Response(),
                bytes: async () => new Uint8Array(0)
            }
        }
    });
    it("正常データ",async()=>{
        const result: CompareApiResult[] = await service.compareTwoText("資源ごみ","資源ごみ");
        console.log(result[0].match)
        console.log(result[0].score)
        console.log(JSON.parse(JSON.stringify(result)));
        expect(result[0].match).toBe("資源ごみ");
        expect(result[0].score).toBe(1.0);
    });
    it("targetがブランクの場合はエラー", async()=>{
        try {
            await service.compareTwoText("","ビン");
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("target or comparison is empty");
        }
    });
    it("comparisonがブランクの場合はエラー", async()=>{
        try {
            await service.compareTwoText("ペットボトル","");
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("target or comparison is empty");
        }
    });
    it("API設定をしていない場合はエラー", async()=>{
        const service = new TrashScheduleService(
            "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter());
        try {
            await service.compareTwoText("ペットボトル","ビン");
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("MecabApiConfig is invalid");
        }
    });
    it("API設定のURLがブランクの場合はエラー", async()=>{
        const service = new TrashScheduleService(
            "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter(),{url: "", api_key: "test"});
        try {
            await service.compareTwoText("ペットボトル","ビン");
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("MecabApiConfig is invalid");
        }
    });
    it("API設定のAPIキーがブランクの場合はエラー", async()=>{
        const service = new TrashScheduleService(
            "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter(),{url: "https://example.com", api_key: ""});
        try {
            await service.compareTwoText("ペットボトル","ビン");
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("MecabApiConfig is invalid");
        }
    });
    it("APIエラー", async()=>{
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
            throw new Error("api error");
        }
        try {
            await service.compareTwoText("ペットボtる","ビン");
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("api error");
        }
    });
});

describe("compareMultipleTrashText",()=>{
    const service = new TrashScheduleService(
        "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter(),{url: "https://example.com", api_key: "test"}
    );
    it("1件の比較対象",async()=>{
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
            return {
                status: 200,
                headers: new Headers(),
                ok: true,
                redirected: false,
                statusText: "OK",
                type: "basic",
                url: "",
                body: null,
                bodyUsed: false,
                json: async () => {},
                text: async () => {
                    const value = Buffer.from(encode([{
                        match: "資源ごみ",
                        score: 1.0
                    }])).toString("base64");
                    return value;
                },
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
                clone: () => new Response(),
                bytes: async () => new Uint8Array(0)
            }
        }
        const result: CompareApiResult[] = await service.compareMultipleTrashText("資源ごみ",["資源ごみ"]);
        expect(result[0].match).toBe("資源ごみ");
        expect(result[0].score).toBe(1.0);
    });
    it("複数件の比較対象",async()=>{
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
            return {
                status: 200,
                headers: new Headers(),
                ok: true,
                redirected: false,
                statusText: "OK",
                type: "basic",
                url: "",
                body: null,
                bodyUsed: false,
                json: async () => {},
                text: async () => {
                    const value = Buffer.from(encode([
                        {match: "資源ごみ",score: 1.0},
                        {match: "ビン",score: 0.5}
                    ])).toString("base64");
                    return value;
                },
                arrayBuffer: async () => new ArrayBuffer(0),
                blob: async () => new Blob(),
                formData: async () => new FormData(),
                clone: () => new Response(),
                bytes: async () => new Uint8Array(0)
            }
        }

        const result: CompareApiResult[] = await service.compareMultipleTrashText("資源ごみ",["資源ごみ","ビン"]);
        expect(result[0].match).toBe("資源ごみ");
        expect(result[0].score).toBe(1.0);
        expect(result[1].match).toBe("ビン");
        expect(result[1].score).toBe(0.5);
    });
    it("targetがブランクの場合はエラー", async()=>{
        try {
            await service.compareMultipleTrashText("",["ビン"]);
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("target is empty");
        }
    });
    it("comparisonがブランクの場合はエラー", async()=>{
        try {
            await service.compareMultipleTrashText("ペットボトル",[]);
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("comparisons is empty");
        }
    });
    it("API設定をしていない場合はエラー", async()=>{
        const service = new TrashScheduleService(
            "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter());
        try {
            await service.compareMultipleTrashText("ペットボトル",["ビン"]);
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("MecabApiConfig is invalid");
        }
    });
    it("API設定のURLがブランクの場合はエラー", async()=>{
        const service = new TrashScheduleService(
            "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter(),{url: "", api_key: "test"});
        try {
            await service.compareMultipleTrashText("ペットボトル",["ビン"]);
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("MecabApiConfig is invalid");
        }
    });
    it("API設定のAPIキーがブランクの場合はエラー", async()=>{
        const service = new TrashScheduleService(
            "Asia/Tokyo", new TextCreator("ja-JP"), new TestDBAdapter(),{url: "https://example.com", api_key: ""});
        try {
            await service.compareMultipleTrashText("ペットボトル",["ビン"]);
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("MecabApiConfig is invalid");
        }
    });
    it("APIエラー", async()=>{
        global.fetch = async (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> => {
            throw new Error("api error");
        }
        try {
            await service.compareMultipleTrashText("ペットボtる",["ビン"]);
            expect(true).toBe(false);
            throw new Error("エラーが発生しませんでした")
        }catch(err){
            expect((err as Error).message).toBe("api error");
        }
    });
});