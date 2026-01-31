import { APIGatewayProxyResultV2 } from "aws-lambda";
import * as  common from "trash-common";
import dbadapter from "./dbadapter.js"
import type { TrashData } from "trash-common";
import { TrashScheduleItem } from "./interface.js"
const logger = common.getLogger();

export default async (trashScheduleItem: TrashScheduleItem): Promise<APIGatewayProxyResultV2>=>{
    logger.info(`Update Data -> ${JSON.stringify(trashScheduleItem)}`);

    try {
        const parsed = JSON.parse(trashScheduleItem.description);
        const trashData: TrashData[] = Array.isArray(parsed) ? parsed : parsed?.trashData ?? [];
        // データチェックの結果に問題がなければ登録する
        if (common.checkTrashes(trashData)) {
            const timestamp = new Date().getTime()
            logger.debug(`update trash schedule -> ${JSON.stringify(trashScheduleItem)}`);
            const currentTrashSchedule = await dbadapter.getTrashScheduleByUserId(trashScheduleItem.id);
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
