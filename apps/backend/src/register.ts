import {getLogger, Logger, TrashData, ScheduleValue, EvweekValue, checkTrashes, ExcludeDate} from "trash-common";
import type { TrashSchedulePayload } from "./types.js";
const logger: Logger = getLogger();
import db from "./dbadapter.js"
import {BackendResponse, SessionItem} from "./interface.js"

interface TrashDataOnWeb {
    type: string,
    trash_val?: string,
    schedules: ScheduleValue[],
    excludes:  ExcludeDate[]
}

interface RegisterRequestBody {
    data: TrashDataOnWeb[],
    globalExcludes?: ExcludeDate[]
}

/**
 * 隔週スケジュールの開始日(start_dateの直前の日曜日)を求める
 * @param {string} start_date : yyyy-mm-dd形式の文字列
 */
const calculateStartDate = (start_date: string) => {
    const start_dt = new Date(start_date);
    const sunday_dt = new Date(start_dt.getTime() - (24 * 60 * 60 * 1000 * start_dt.getUTCDay()));

    return `${sunday_dt.getUTCFullYear()}-${sunday_dt.getUTCMonth()+1}-${sunday_dt.getUTCDate()}`;
};

const validateGlobalExcludes = (globalExcludes: ExcludeDate[] = []): ExcludeDate[] | null => {
    if (globalExcludes.length > 10) return null;
    const isValid = globalExcludes.every((exclude) => {
        if (exclude.month < 1 || exclude.month > 12) return false;
        if (exclude.date < 1) return false;
        if (exclude.month === 2) return exclude.date <= 29;
        if ([1, 3, 5, 7, 8, 10, 12].includes(exclude.month)) return exclude.date <= 31;
        return exclude.date <= 30;
    });
    return isValid ? globalExcludes : null;
};

export const adjustData = (input_data: TrashDataOnWeb[] | null | undefined, globalExcludes: ExcludeDate[] = []): TrashSchedulePayload | null => {
    if (!input_data || !Array.isArray(input_data)) {
        return null;
    }
    const regist_data: TrashData[] = [];
    const sanitizedGlobalExcludes = validateGlobalExcludes(globalExcludes);
    if (!sanitizedGlobalExcludes) {
        return null;
    }
    try {
        input_data.forEach((trash)=>{
            let regist_trash: any = {
                type: trash.type,
                schedules: [],
                excludes: []
            };
            if(trash.type === "other") {
                regist_trash.trash_val = trash.trash_val;
            }

            let trash_schedules:  ScheduleValue[] = [];
            trash.schedules.forEach((schedule: ScheduleValue)=>{
                if(schedule.type && schedule.type != "none" && schedule.value) {
                    let regist_schedule = {
                        type: schedule.type,
                        value: schedule.value
                    };
                    if(regist_schedule.type === "evweek") {
                        const evweekValue: EvweekValue = regist_schedule.value as EvweekValue;
                        const start_date = calculateStartDate(evweekValue.start);
                        evweekValue.start = start_date;
                    }
                    trash_schedules.push(regist_schedule);
                }
            });
            regist_trash.schedules = trash_schedules;
            regist_trash.excludes = trash.excludes;
            regist_data.push(regist_trash);
        });
    } catch(err) {
        logger.error("adjust error:" + err);
    }
    return {
        trashData: regist_data,
        globalExcludes: sanitizedGlobalExcludes
    };
}

export default async(body: any,session: SessionItem): Promise<BackendResponse>=>{
    // 検証した登録データをセッションに格納
    if(body && session && session.state && session.client_id && session.redirect_uri) {
        logger.info(`Regist request from ${session.id}`);
        logger.debug("Regist Data:"+ JSON.stringify(body));

        const requestBody = body as RegisterRequestBody;
        const adjusted = adjustData(requestBody.data, requestBody.globalExcludes ?? []);
        if (!adjusted) {
            return {
                statusCode: 400,
                body: "Bad Data"
            };
        }
        const regist_data = adjusted;
        if (!checkTrashes(regist_data.trashData, regist_data.globalExcludes)) {
            logger.error(`platform: ${session.platform}`);
            return {
                statusCode: 400,
                body: "Bad Data"
            }
        }

        const item: any = {};
        if(session.userInfo) {
            item.signinId = session.userInfo.signinId;
            item.signinService = session.userInfo.signinService;
            if(session.userInfo.id) {
                item.id = session.userInfo.id;
            }
            }

        try {
            if(!item.id) {
                item.id = await db.publishId();
            }

            // データ登録
            item.description = JSON.stringify(regist_data.trashData);
            item.globalExcludes = regist_data.globalExcludes ?? [];
            item.platform  = session.platform;
            item.nextdayflag = (typeof(body.nextdayflag) != "undefined") && (body.nextdayflag != null) && body.nextdayflag;
            await db.putTrashSchedule(item, regist_data);

            // authorization codeを発行しid（access_tokenとセットで保存する,期限は5分）
            const authorizationCode = await db.putAuthorizationCode(item.id, session.client_id, session.redirect_uri, 300);

            // セッションを削除する
            await db.deleteSession(session.id);

            const redirect_url = `${session.redirect_uri}?state=${session.state}&code=${authorizationCode.code}`;
            logger.debug("redirect to amazon auhorize service:"+ redirect_url);
            return {
                statusCode: 200,
                body: redirect_url,
                headers: {
                    "Cache-Control": "no-store"
                }
            }
        } catch(err: any) {
            logger.error(err);
            return {
                statusCode: 500,
                body: "Registration Failed"
            }
        }
    } else {
        logger.error("invalid parameter"+
            JSON.stringify({body: body,session:session}));
        return {
            statusCode: 400,
            body: "Invalid Parameters"
        }
    }

}
