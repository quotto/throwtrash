import type { LocaleText } from "./client.mjs";
import type { TrashData, TrashTypeValue, EvweekValue, ExcludeDate, ScheduleValue } from "../types.mjs";
import { DBAdapter } from "./db-adapter.mjs";
import { TextCreator } from "./text-creator.mjs";
export type CompareApiRequest = {
    target: string;
    comparisons: string[];
};
export type CompareApiResult = {
    score: number;
    match: string;
};
export type RecentTrashDate = {
    key: string;
    schedules: ScheduleValue[];
    excludes: ExcludeDate[];
    list: Date[];
    recent: Date;
};
export type GetTrashDataResult = {
    status: string;
    response?: TrashData[];
    checkedNextday?: boolean;
    msgId?: keyof LocaleText;
};
export declare class TrashScheduleService {
    private dbAdapter;
    private timezone;
    private textCreator;
    private mecabApiConfig?;
    constructor(_timezone: string, _text_creator: TextCreator, _dbAdapter: DBAdapter, _mecabApiConfig?: {
        url: string;
        api_key: string;
    });
    /**
     * access_tokenが一致するゴミ出し予定を取得する
     * @param access_token アクセストークン
     * @returns 全ゴミ出し予定とエラーがあった場合のステータスコードおよびメッセージID
     */
    getTrashData(access_token: string): Promise<GetTrashDataResult>;
    /**
     * 引数で指定されたn日後を示すDateインスタンスを返す。
     * このインスタンスはgetXXXが返す値rユーザーロケールとなるようにオフセットが設定される。
     * @param target_day 今日を基準としたn日後を示す。0なら今日、1なら明日……という感じ
     * @returns Dateインスタンス
     */
    calculateLocalTime(target_day: number): Date;
    /**
     * 指定された曜日が現時点から何日後かを返す
     * @param target_weekday 対象の曜日
     * @returns 対象曜日が今日から何日後かを示す値
     */
    getTargetDayByWeekday(target_weekday: number): number;
    /**
     * 指定された日付で指定されたゴミが出せるかをチェックする
     * @param trash 対象のゴミ
     * @param dt 指定日
     * @returns ゴミ出し可能ならゴミの名称を,不可能ならundefinedを返す
     */
    getEnableTrashData(trash: TrashData, dt: Date): TrashTypeValue | undefined;
    /**
     * 全ゴミ出しデータの中から指定された日にちにゴミ捨て可能な一覧を返す
     * @param trashes 全ゴミ出しデータ
     * @param target_day 指定日、現在日からのn日を指す
     * @returns その日にゴミ出し可能なゴミの名称一覧
     */
    checkEnableTrashes(trashes: Array<TrashData>, target_day: number): Promise<Array<TrashTypeValue>>;
    /**
     * スケジュールの種類と値に従い本日以降（本日を含む）で最も近い日にちを返す。
     * @param {Date} today タイムゾーンを考慮した今日の日付
     * @param {String} schedule_type スケジュールの種類
     * @param {String} schedule_val スケジュールの値
     * @returns {Date} 条件に合致する直近の日にち
     */
    calculateNextDateBySchedule(today: Date, schedule_type: string, schedule_val: string | EvweekValue, excludes: ExcludeDate[]): Date;
    /**
     * 指定したごみの種類から直近のゴミ捨て日を求める。
     * trashesの中に同一のゴミ（typeが同じ）があれば一つにまとめる。ただしtypeがotherの場合のみゴミの名前（trash_val）で区別するため、戻り値のkeyは複数になる可能性がある。
     * @param {Array} trashes DynamoDBから取得した登録済みごみ出し予定
     * @param {string}} target_type 検索するゴミの種類
     * @returns {object} target_typeで指定されたゴミの直近の予定日プロパティ。{key:ゴミの種類,schedules:登録されているごみ出し予定,list:登録スケジュールから算出した直近の予定日,recent: listの中で最も近い日}
     */
    getDayByTrashType(trashes: Array<TrashData>, target_type: string): RecentTrashDate[];
    /**
     *
     * @param {Number} target_week  0:今週, 1:来週
     * @returns {Array} {target_day: オブジェクト配列
     */
    getRemindBody(target_week: number, trash_data: Array<TrashData>): Promise<{
        target_day: number;
        body: Array<TrashTypeValue | undefined>;
    }[]>;
    /**
     * このメソッドは2つのゴミの名前を比較し、類似度を返す
     * 類似度は0.0～1.0の範囲で返され、1.0に近いほど類似している
     * 比較のための計算処理は外部APIを利用する
     *
     * @param target 比較するゴミの名前1
     * @param comparison 比較するゴミの名前2
     * @returns
     */
    compareTwoText(target: string, comparison: string): Promise<CompareApiResult[]>;
    /**
     * 指定されたゴミの名前と複数のゴミの名前を比較し、各ゴミの類似度を返す
     * @param target ゴミの名前
     * @param comparisons 比較するゴミの名前の配列
     * @returns 比較結果の配列
     */
    compareMultipleTrashText(target: string, comparisons: string[]): Promise<CompareApiResult[]>;
    private validateMecabApiConfig;
}
