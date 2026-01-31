"use strict";
import enUSWord from "./template_text/en-US.common.json" with { type: "json" };
import enUSText from "./template_text/en-US.text.json" with { type: "json" };
import jaJPWord from "./template_text/ja-JP.common.json" with { type: "json" };
import jaJPText from "./template_text/ja-JP.text.json" with { type: "json" };
const Text_Map = {
    "en-US": {
        "word": enUSWord,
        "message": enUSText
    },
    "ja-JP": {
        "word": jaJPWord,
        "message": jaJPText
    }
};
const get_num_sufix = (number) => {
    let suffix = "th";
    if (number === 1) {
        suffix = "st";
    }
    else if (number === 2) {
        suffix = "nd";
    }
    else if (number === 3) {
        suffix = "rd";
    }
    return String(number) + suffix;
};
export class TextCreator {
    locale;
    localeText;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commonText;
    /**
     *
     * @param {string} locale  デバイスから取得できるロケール情報
     */
    constructor(locale) {
        this.locale = locale;
        this.localeText = Text_Map[this.locale].message;
        this.commonText = Text_Map[this.locale].word;
    }
    createTrashMessageBody(trash_items) {
        const trash_name_list = [];
        trash_items.forEach((item) => {
            trash_name_list.push(item.type === "other" ? item.name : this.commonText.trashname[item.type]);
        });
        const response_trashes = trash_name_list.join(this.localeText.SEPARATOR);
        return response_trashes;
    }
    /**
     * 今日出せるゴミをテキスト化する
     * @param {Array<object>} trash_items typeとnameを要素に持つJSONオブジェクトの配列
     * @return {string} レスポンスに格納するテキスト
     */
    getLaunchResponse(trash_items) {
        if (trash_items.length === 0) {
            return this.localeText.ANSWER_NOTHING;
        }
        else {
            const body = this.createTrashMessageBody(trash_items);
            return this.localeText.ANSWER_LAUNCH.replace("%s", body);
        }
    }
    getPointdayResponse(target_day, trash_items) {
        if (trash_items.length === 0) {
            return this.localeText.ANSWER_NOTHING_A_DAY.replace("%s", this.commonText.pointday[target_day]);
        }
        else {
            const body = this.createTrashMessageBody(trash_items);
            return this.localeText.ANSWER_A_DAY.replace("%s1", this.commonText.pointday[target_day]).replace("%s2", body);
        }
    }
    getDayByTrashTypeMessage(slot_value, target_trash) {
        if (target_trash.length === 0) {
            return this.localeText.ANSWER_NOTHING_TRASH.replace("%s", slot_value.name);
        }
        if (slot_value.type === "other") {
            const part_text = [];
            target_trash.forEach((trash) => {
                part_text.push(this.localeText.ANSWER_A_TRASH.replace("%s1", trash.key)
                    .replace("%s2", this.localeText.ANSWER_DATE
                    .replace("%m", this.commonText.month ? this.commonText.month[trash.recent.getMonth()] : trash.recent.getMonth() + 1)
                    .replace("%d", trash.recent.getDate().toString())
                    .replace("%w", this.commonText.weekday[trash.recent.getDay()])));
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
                .replace("%w", this.commonText.weekday[target_trash[0].recent.getDay()])));
        }
    }
    getMessage(message_id) {
        return this.localeText[message_id];
    }
    getReminderConfirm(week_type, time) {
        return this.localeText.REMINDER_CONFIRM.replace("%s1", week_type).replace("%s2", time);
    }
    getReminderComplete(week_type, time) {
        return this.localeText.REMINDER_DEFINE.replace("%s1", week_type).replace("%s2", time);
    }
    getTrashName(trash_type) {
        return this.commonText.trashname[trash_type];
    }
    /*
    全てのゴミ出し予定を整形された文書データで返す
    trashes: DynamoDBから取得したJSON形式のパラメータ
    */
    getAllSchedule(trashes) {
        const return_data = [];
        trashes.forEach((trash) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const trash_data = {};
            trash_data.type = trash.type;
            trash_data.typeText = trash.type != "other" ? this.getTrashName(trash.type) : trash.trash_val;
            trash_data.schedules = [];
            trash.schedules.forEach((schedule) => {
                if (schedule.type == "weekday") {
                    const scheduleValue = schedule.value;
                    trash_data.schedules.push(`${this.commonText.schedule.weekday.replace("%s", this.commonText.weekday[scheduleValue])}`);
                }
                else if (schedule.type == "biweek") {
                    const scheduleValue = schedule.value;
                    const matches = scheduleValue.match(/(\d)-(\d)/);
                    if (matches) {
                        const weekday = matches[1];
                        const turn = this.locale === "en-US" ? get_num_sufix(Number(matches[2])) : matches[2];
                        trash_data.schedules.push(this.commonText.schedule.biweek.replace("%s1", turn).replace("%s2", this.commonText.weekday[weekday]));
                    }
                }
                else if (schedule.type == "month") {
                    const scheduleValue = schedule.value;
                    const day = this.locale === "en-US" ? get_num_sufix(Number(scheduleValue)) : scheduleValue;
                    trash_data.schedules.push(`${this.commonText.schedule.month.replace("%s", day)}`);
                }
                else if (schedule.type == "evweek") {
                    const scheduleValue = schedule.value;
                    trash_data.schedules.push(`${this.commonText.schedule.evweek.replace("%s1", this.commonText.weekday[scheduleValue.weekday]).replace("%s2", scheduleValue.interval)}`);
                }
            });
            return_data.push(trash_data);
        });
        return return_data;
    }
    get registerd_card_title() {
        return this.localeText.CARD_TITLE;
    }
    getRegisterdContentForCard(schedule_data) {
        let card_text = "";
        schedule_data.forEach((data) => {
            card_text += `${data.typeText}: ${data.schedules.join(this.localeText.SEPARATOR)}\n`;
        });
        return card_text;
    }
}
