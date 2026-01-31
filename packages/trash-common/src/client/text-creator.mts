import type {TrashTypeValue,TrashData,EvweekValue} from "../types.mjs";

import enUSWord from "./template_text/en-US.common.json" with { type: "json" };
import enUSText from "./template_text/en-US.text.json" with { type: "json" };
import jaJPWord from "./template_text/ja-JP.common.json" with { type: "json" };
import jaJPText from "./template_text/ja-JP.text.json" with { type: "json" };
export type LocaleText = {
    ERROR_GENERAL:string,
    ERROR_ID_NOT_FOUND:string,
    ERROR_UNKNOWN:string,
    HELP_ACCOUNT:string,
    HELP_DESCRIBE:string,
    HELP_BYE:string,
    HELP_NEXT_PREVIOUS:string,
    NOTICE_CONTINUE:string,
    ASK_A_DAY:string,
    NOTICE_SEND_SCHEDULE:string,
    NOTICE_NOT_CORRESPOND:string,
    ANSWER_LAUNCH:string,
    ANSWER_NOTHING:string,
    ANSWER_A_DAY:string,
    ANSWER_NOTHING_A_DAY:string,
    ANSWER_BY_TRASH:string,
    ANSWER_A_TRASH:string,
    ANSWER_DATE:string,
    ANSWER_NOTHING_TRASH:string,
    REMINDER_PERMISSION:string,
    REMINDER_WEEK:string,
    REMINDER_TIME:string,
    REMINDER_COMPLETE:string,
    REMINDER_CONFIRM:string,
    REMINDER_DEFINE:string,
    REMINDER_CANCEL:string,
    CARD_TITLE:string,
    PURCHASE_THANKS:string,
    PURCHASE_ALREADY_PURCHASED:string,
    PURCHASE_REPROMPT:string,
    PURCHASE_CANCEL:string,
    PURCHASE_OK:string,
    PURCHASE_UPSELL:string,
    SEPARATOR:string,
    CHECK_MULTIPLE: boolean,
    END_SEP: string
}
export interface TrashDataText {
    type: string,
    typeText: string,
    schedules: string[]
}

type LocaleTextMap = {
    [key: string]: {
        word: unknown
        message: LocaleText,
    }
}

const Text_Map: LocaleTextMap = {
    "en-US": {
        "word": enUSWord,
        "message": enUSText
    },
    "ja-JP": {
        "word": jaJPWord,
        "message": jaJPText
    }
}


const get_num_sufix = (number: number): string => {
    let suffix = "th";
    if (number === 1) {
        suffix = "st";
    } else if (number === 2) {
        suffix = "nd";
    } else if (number === 3) {
        suffix = "rd";
    }

    return String(number) + suffix;
}

export class TextCreator {

    private locale: string;
    private localeText: LocaleText;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private commonText: any;

    /**
     *
     * @param {string} locale  デバイスから取得できるロケール情報
     */
    constructor(locale: string) {
        this.locale = locale;
        this.localeText = Text_Map[this.locale].message;
        this.commonText = Text_Map[this.locale].word;
    }

    createTrashMessageBody(trash_items: TrashTypeValue[]): string {
        const trash_name_list: string[] = [];
        trash_items.forEach((item) => {
            trash_name_list.push(
                item.type === "other" ? item.name : this.commonText.trashname[item.type]
            );
        });
        const response_trashes = trash_name_list.join(this.localeText.SEPARATOR);
        return response_trashes;
    }

    /**
     * 今日出せるゴミをテキスト化する
     * @param {Array<object>} trash_items typeとnameを要素に持つJSONオブジェクトの配列
     * @return {string} レスポンスに格納するテキスト
     */
    getLaunchResponse(trash_items: TrashTypeValue[]): string {
        if(trash_items.length === 0) {
            return this.localeText.ANSWER_NOTHING;
        } else {
            const body = this.createTrashMessageBody(trash_items);
            return this.localeText.ANSWER_LAUNCH.replace("%s", body);
        }
    }

    getPointdayResponse(target_day: string, trash_items: TrashTypeValue[]): string {
        if(trash_items.length === 0) {
            return this.localeText.ANSWER_NOTHING_A_DAY.replace("%s", this.commonText.pointday[target_day]);
        } else {
            const body = this.createTrashMessageBody(trash_items);
            return this.localeText.ANSWER_A_DAY.replace("%s1", this.commonText.pointday[target_day]).replace("%s2", body);
        }
    }

    getDayByTrashTypeMessage(slot_value: TrashTypeValue, target_trash: {key: string,recent: Date}[]): string {
        if (target_trash.length === 0) {
            return this.localeText.ANSWER_NOTHING_TRASH.replace("%s", slot_value.name);
        }
        if (slot_value.type === "other") {
            const part_text: string[] = []
            target_trash.forEach((trash) => {
                part_text.push(
                    this.localeText.ANSWER_A_TRASH.replace("%s1", trash.key)
                        .replace("%s2", this.localeText.ANSWER_DATE
                            .replace("%m", this.commonText.month ? this.commonText.month[trash.recent.getMonth()] : trash.recent.getMonth() + 1)
                            .replace("%d", trash.recent.getDate().toString())
                            .replace("%w", this.commonText.weekday[trash.recent.getDay()]
                            ))
                );
            });
            const body = part_text.join(this.localeText.SEPARATOR);
            return this.localeText.ANSWER_BY_TRASH.replace("%s", body);
        }
        else {
            return this.localeText.ANSWER_BY_TRASH.replace("%s", this.localeText.ANSWER_A_TRASH
                .replace("%s1", slot_value.name)
                .replace("%s2", this.localeText.ANSWER_DATE
                    .replace("%m", this.commonText.month ? this.commonText.month[target_trash[0].recent.getMonth()] : target_trash[0].recent.getMonth() + 1)
                    .replace("%d", target_trash[0].recent.getDate().toString())
                    .replace("%w", this.commonText.weekday[target_trash[0].recent.getDay()])
                ));

        }
    }

    getMessage(message_id: keyof LocaleText): string {
        return this.localeText[message_id] as string;
    }

    getReminderConfirm(week_type: string, time: string): string {
        return this.localeText.REMINDER_CONFIRM.replace("%s1", week_type).replace("%s2", time);
    }

    getReminderComplete(week_type: string, time: string): string {
        return this.localeText.REMINDER_DEFINE.replace("%s1", week_type).replace("%s2", time);
    }

    getTrashName(trash_type: string): string {
        return this.commonText.trashname[trash_type];
    }

    /*
    全てのゴミ出し予定を整形された文書データで返す
    trashes: DynamoDBから取得したJSON形式のパラメータ
    */
    getAllSchedule(trashes: TrashData[]): TrashDataText[] {
        const return_data: TrashDataText[] = [];
        trashes.forEach((trash)=>{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const trash_data: any = {};
            trash_data.type = trash.type;
            trash_data.typeText = trash.type != "other" ? this.getTrashName(trash.type) : trash.trash_val;

            trash_data.schedules = [];
            trash.schedules.forEach((schedule)=>{
                if(schedule.type == "weekday") {
                    const scheduleValue: string = schedule.value as string;
                    trash_data.schedules.push(`${this.commonText.schedule.weekday.replace("%s",this.commonText.weekday[scheduleValue])}`);
                } else if(schedule.type == "biweek") {
                    const scheduleValue: string = schedule.value as string;
                    const matches: RegExpMatchArray | null = scheduleValue.match(/(\d)-(\d)/);
                    if(matches) {
                        const weekday = matches[1];
                        const turn: string = this.locale === "en-US" ? get_num_sufix(Number(matches[2])) : matches[2];
                        trash_data.schedules.push(this.commonText.schedule.biweek.replace("%s1",turn).replace("%s2",this.commonText.weekday[weekday]));
                    }
                } else if(schedule.type == "month") {
                    const scheduleValue: string = schedule.value as string;
                    const day = this.locale === "en-US" ? get_num_sufix(Number(scheduleValue)) : scheduleValue;
                    trash_data.schedules.push(`${this.commonText.schedule.month.replace("%s",day)}`);
                } else if(schedule.type == "evweek") {
                    const scheduleValue: EvweekValue = schedule.value as EvweekValue;
                    trash_data.schedules.push(`${this.commonText.schedule.evweek.replace("%s1",this.commonText.weekday[scheduleValue.weekday]).replace("%s2",scheduleValue.interval)}`);
                }
            });
            return_data.push(trash_data);
        });
        return return_data;
    }

    get registerd_card_title(): string {
        return this.localeText.CARD_TITLE;
    }

    getRegisterdContentForCard(schedule_data: TrashDataText[]): string {
        let card_text = "";
        schedule_data.forEach((data) => {
            card_text += `${data.typeText}: ${data.schedules.join(this.localeText.SEPARATOR)}\n`;
        });

        return card_text;
    }
}