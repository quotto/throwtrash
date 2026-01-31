import * as common from "trash-common";
import dbadapter from "./dbadapter.js"
import { TrashScheduleItem } from "./interface.js"
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
const logger = common.getLogger();
export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2>=> {
    logger.debug(`sync parameters: ${JSON.stringify(params)}`);
    if(params.user_id) {
        const trashScheduleItem: TrashScheduleItem | null = await dbadapter.getTrashScheduleByUserId(params.user_id);
        logger.debug(`Response trash schedule -> ${JSON.stringify(trashScheduleItem)}`);
        if (trashScheduleItem != null) {
            if(trashScheduleItem.shared_id) {
                const sharedSchedule = await dbadapter.getSharedScheduleBySharedId(trashScheduleItem.shared_id);
                if(sharedSchedule === null) {
                    logger.error(`TrashScheduleItem id=${params.user_id} has shared_id: ${trashScheduleItem.shared_id}, but SharedSchedule is not exist.`);
                    return {
                        statusCode: 500
                    }
                }

                let syncResult = true;
                if(typeof(trashScheduleItem.timestamp) === "undefined" || sharedSchedule?.timestamp >= trashScheduleItem.timestamp) {
                    logger.info("sync SharedSchedule to TrashSchedule");
                    logger.info(`SharedSchedule-> ${JSON.stringify(sharedSchedule)}`);
                    logger.info(`TrashSchedule-> ${JSON.stringify(trashScheduleItem)}`);
                    trashScheduleItem.description = sharedSchedule?.description;
                    trashScheduleItem.timestamp = sharedSchedule.timestamp;

                    syncResult = await dbadapter.putExistTrashSchedule(trashScheduleItem, sharedSchedule.timestamp);
                } else {
                    logger.info("sync TrashSchedule to SharedSchedule ");
                    logger.info(`TrashSchedule-> ${JSON.stringify(trashScheduleItem)}`);
                    logger.info(`SharedSchedule-> ${JSON.stringify(sharedSchedule)}`);
                    syncResult = await dbadapter.putSharedSchedule(sharedSchedule.shared_id, trashScheduleItem);
                }
                if(!syncResult) {
                    logger.error("failed sync TrashScedule, SharedSchedule");
                    return {
                        statusCode: 500
                    }
                }
            }
            return { statusCode: 200, body: JSON.stringify(trashScheduleItem) };
        } else {
            logger.error(`id not found: ${params.user_id}`);
            return {
                statusCode: 400
            };
        }
    }
    return {
        statusCode: 400
    };
}