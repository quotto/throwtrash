import { APIGatewayProxyResultV2 } from "aws-lambda";
import * as  common from "trash-common";
import dbadapter from "./dbadapter.js"
import type { ExcludeDate, TrashData } from "trash-common";
import { TrashScheduleItem } from "./interface.js"
const logger = common.getLogger();

const parseDescription = (description: string): { trashData: TrashData[]; globalExcludes: ExcludeDate[] } | null => {
    try {
        const parsed = JSON.parse(description);
        if (Array.isArray(parsed)) {
            return { trashData: parsed, globalExcludes: [] };
        }
        return null;
    } catch (err) {
        logger.error(String(err));
        return null;
    }
};

export default async (trashScheduleItem: TrashScheduleItem): Promise<APIGatewayProxyResultV2>=>{
    logger.info(`Update Data -> ${JSON.stringify(trashScheduleItem)}`);

    try {
        const parsed = parseDescription(trashScheduleItem.description);
        if (!parsed) {
            logger.error(`invalid trash schedule: ${trashScheduleItem.description}`);
            return {
                statusCode: 400
            }
        }
        const trashData = parsed.trashData;
        const requestedGlobalExcludes = Array.isArray(trashScheduleItem.globalExcludes)
            ? trashScheduleItem.globalExcludes
            : parsed.globalExcludes.length > 0
                ? parsed.globalExcludes
                : undefined;
        trashScheduleItem.description = JSON.stringify(trashData);
        // データチェックの結果に問題がなければ登録する
        const currentTrashSchedule = await dbadapter.getTrashScheduleByUserId(trashScheduleItem.id);
        const effectiveGlobalExcludes = requestedGlobalExcludes
            ?? (Array.isArray(currentTrashSchedule?.globalExcludes) ? currentTrashSchedule?.globalExcludes : []);
        trashScheduleItem.globalExcludes = effectiveGlobalExcludes;
        if (common.checkTrashes(trashData, effectiveGlobalExcludes)) {
            const timestamp = new Date().getTime()
            logger.debug(`update trash schedule -> ${JSON.stringify(trashScheduleItem)}`);
            // リクエストパラメータのタイムスタンプと現在のDBタイムスタンプが一致しない場合はエラー
            if(currentTrashSchedule?.timestamp != trashScheduleItem.timestamp) {
                logger.error(`invalid timestamp parameters: ${currentTrashSchedule?.timestamp}(remote) <-> ${trashScheduleItem.timestamp}(params)`);
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        timestamp: currentTrashSchedule?.timestamp
                    })
                }
            }
            let updateResult = false;
            if(currentTrashSchedule?.shared_id) {
                // shared_idが設定されてい場合はTrashScheduleとSharedScheduleをトランザクション内で更新する
                logger.info(`update shared schedule item-> shared_id:${currentTrashSchedule.shared_id}, schedule: ${JSON.stringify(trashScheduleItem)}, timestamp: ${timestamp}`);
                updateResult = await dbadapter.transactionUpdateScheduleAndSharedSchedule(currentTrashSchedule.shared_id, trashScheduleItem, timestamp);

            } else {
                logger.info(`update trash schedule item-> schedule: ${JSON.stringify(trashScheduleItem)}, timestamp: ${timestamp}`);
                updateResult = await dbadapter.putExistTrashSchedule(trashScheduleItem, timestamp);
            }
            if(updateResult) {
                return { statusCode: 200, body: JSON.stringify({ timestamp: timestamp } )};
            } else {
                return { statusCode: 500 }
            }
        } else {
            logger.error(`invalid trash schedule: ${trashScheduleItem.description}`);
            return {
                statusCode: 400
            }
        }
    } catch (err: any) {
        logger.error(err);
        return { statusCode: 400 }
    }
}
