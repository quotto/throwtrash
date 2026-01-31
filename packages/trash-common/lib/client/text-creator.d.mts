import type { TrashTypeValue, TrashData } from "../types.mjs";
export type LocaleText = {
    ERROR_GENERAL: string;
    ERROR_ID_NOT_FOUND: string;
    ERROR_UNKNOWN: string;
    HELP_ACCOUNT: string;
    HELP_DESCRIBE: string;
    HELP_BYE: string;
    HELP_NEXT_PREVIOUS: string;
    NOTICE_CONTINUE: string;
    ASK_A_DAY: string;
    NOTICE_SEND_SCHEDULE: string;
    NOTICE_NOT_CORRESPOND: string;
    ANSWER_LAUNCH: string;
    ANSWER_NOTHING: string;
    ANSWER_A_DAY: string;
    ANSWER_NOTHING_A_DAY: string;
    ANSWER_BY_TRASH: string;
    ANSWER_A_TRASH: string;
    ANSWER_DATE: string;
    ANSWER_NOTHING_TRASH: string;
    REMINDER_PERMISSION: string;
    REMINDER_WEEK: string;
    REMINDER_TIME: string;
    REMINDER_COMPLETE: string;
    REMINDER_CONFIRM: string;
    REMINDER_DEFINE: string;
    REMINDER_CANCEL: string;
    CARD_TITLE: string;
    PURCHASE_THANKS: string;
    PURCHASE_ALREADY_PURCHASED: string;
    PURCHASE_REPROMPT: string;
    PURCHASE_CANCEL: string;
    PURCHASE_OK: string;
    PURCHASE_UPSELL: string;
    SEPARATOR: string;
    CHECK_MULTIPLE: boolean;
    END_SEP: string;
};
export interface TrashDataText {
    type: string;
    typeText: string;
    schedules: string[];
}
export declare class TextCreator {
    private locale;
    private localeText;
    private commonText;
    /**
     *
     * @param {string} locale  デバイスから取得できるロケール情報
     */
    constructor(locale: string);
    createTrashMessageBody(trash_items: TrashTypeValue[]): string;
    /**
     * 今日出せるゴミをテキスト化する
     * @param {Array<object>} trash_items typeとnameを要素に持つJSONオブジェクトの配列
     * @return {string} レスポンスに格納するテキスト
     */
    getLaunchResponse(trash_items: TrashTypeValue[]): string;
    getPointdayResponse(target_day: string, trash_items: TrashTypeValue[]): string;
    getDayByTrashTypeMessage(slot_value: TrashTypeValue, target_trash: {
        key: string;
        recent: Date;
    }[]): string;
    getMessage(message_id: keyof LocaleText): string;
    getReminderConfirm(week_type: string, time: string): string;
    getReminderComplete(week_type: string, time: string): string;
    getTrashName(trash_type: string): string;
    getAllSchedule(trashes: TrashData[]): TrashDataText[];
    get registerd_card_title(): string;
    getRegisterdContentForCard(schedule_data: TrashDataText[]): string;
}
