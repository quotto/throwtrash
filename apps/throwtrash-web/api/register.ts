import { APIGatewayProxyResultV2, APIGatewayProxyEventQueryStringParameters, APIGatewayEventDefaultAuthorizerContext, APIGatewayProxyEventBase } from "aws-lambda";
import * as  common from "trash-common";
import dbadapter from "./dbadapter.js"
import { RegisteredTrashScheduleItem } from "./interface.js"
const logger = common.getLogger();

export default async (event_body_str: string) => {
    let event_body;
    try {
        event_body =JSON.parse(event_body_str)
        if(typeof(event_body.platform) === "undefined" || event_body.platform.length === 0) {
            logger.error(`invalid parameter: platform -> ${event_body.platform}`);
            return { statusCode: 400 };
        }
    } catch (e: any) {
        logger.error(e)
        return { statusCode: 400 };
    }
    const id = common.generateUUID("-");
    logger.debug(`publish user id -> ${id}`)

    const timestamp = new Date().getTime();
    const registeredItem = {
        id: id,
        description: JSON.stringify({ trashData: [], globalExcludes: [] }),
        platform: event_body.platform
    }

    logger.info(`register user: ${JSON.stringify(registeredItem)}, timestamp: ${timestamp}`);
    if (await dbadapter.insertTrashSchedule(registeredItem, timestamp)) {
        return { statusCode: 200, body: JSON.stringify({ id: id, timestamp: timestamp }) };
    } else {
        return { statusCode: 500 };
    }
}
