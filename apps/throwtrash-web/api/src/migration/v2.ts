import * as common from "trash-common";
const logger = common.getLogger();
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
import error_def from "../error_def.js"
import dbadapter from "../dbadapter.js"

export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyResultV2> => {
    if(typeof(params.user_id) === "undefined" || params.user_id === null || params.user_id.length === 0) {
        return error_def.UserError
    }
    const timestamp = new Date().getTime()
    logger.info(`migration user_id=${params.user_id}, udpate TrashSchedule timestamp: ${timestamp}`)
    if(await dbadapter.updateTrashScheduleTimestamp(params.user_id, timestamp)) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                timestamp: timestamp
            })
        }
    } else {
        return error_def.ServerError
    }
}