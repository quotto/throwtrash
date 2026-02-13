import * as common from "trash-common";
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
import dbadapter from "./dbadapter.js";

const logger = common.getLogger();

const normalizeDescription = (description: string): string => {
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed);
    }
    return description;
  } catch {
    return description;
  }
};

export default async function activate(
  params: APIGatewayProxyEventQueryStringParameters
): Promise<APIGatewayProxyResultV2> {
  if (!params.code || !params.user_id) {
    logger.error("parameters not contains code or user_id");
    return { statusCode: 400 };
  }

  const activationCode = await dbadapter.getActivationCode(params.code);
  if (!activationCode) {
    logger.error(`Activation Code Not Found: ${params.code}`);
    return { statusCode: 400 };
  }

  logger.debug(`receive activation Code -> ${JSON.stringify(activationCode)}`);

  if (!(await dbadapter.setSharedIdToTrashSchedule(params.user_id, activationCode.shared_id))) {
    return { statusCode: 500 };
  }

  logger.info(`set shared_id ${activationCode.shared_id} to user_id ${params.user_id}`);

  const sharedSchedule = await dbadapter.getSharedScheduleBySharedId(activationCode.shared_id);
  if (!sharedSchedule) {
    return { statusCode: 500 };
  }

  const normalizedDescription = normalizeDescription(sharedSchedule.description);
  const updateTrashScheduleResult = dbadapter.updateTrashSchedule(
    params.user_id,
    normalizedDescription,
    sharedSchedule.timestamp,
    sharedSchedule.globalExcludes
  );
  const deleteResult = dbadapter.deleteActivationCode(activationCode.code);
  const response = await Promise.all([updateTrashScheduleResult, deleteResult]);
  logger.debug(JSON.stringify(response));

  if (!response[0]) {
    return { statusCode: 500 };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      description: normalizedDescription,
      timestamp: sharedSchedule.timestamp,
    }),
  };
}
