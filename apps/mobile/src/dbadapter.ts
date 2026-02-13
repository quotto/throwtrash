import property from "./property.js"
import * as common from "trash-common";
const logger = common.getLogger();
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    TransactWriteCommand,
    UpdateCommand,
    type PutCommandInput
} from "@aws-sdk/lib-dynamodb";
const dynamoClient = new DynamoDBClient({ region: process.env.DB_REGION });
let documentClient = DynamoDBDocumentClient.from(dynamoClient);
export const setDocumentClient = (client: DynamoDBDocumentClient) => {
    documentClient = client;
};
import crypto from "crypto";
import {  AccountLinkItem, ActivationCodeItem, CodeItem, SharedScheduleItem, TrashScheduleItem } from "./interface.js"


const toHash = (value: string): string => {
    return crypto.createHash("sha512").update(value).digest("hex");
}

const SharedSchedulePutOperation = (shared_id: string, description: string, timestamp: number, globalExcludes: TrashScheduleItem["globalExcludes"]): PutCommandInput => {
    const item: PutCommandInput = {
        TableName: property.SHARED_SCHEDULE_TABLE,
        Item: {
            shared_id: shared_id,
            description: description,
            timestamp: timestamp
        }
    };
    if (Array.isArray(globalExcludes)) {
        (item.Item as Record<string, unknown>).globalExcludes = globalExcludes;
    }
    return item;
}

const ExistTrashScheduleWithSharedIdPutOperation = (user_id: string, description: string, platform: string, timestamp: number, shared_id: string, globalExcludes: TrashScheduleItem["globalExcludes"]): PutCommandInput => {
    const item: PutCommandInput = {
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: {
            id: user_id,
            description: description,
            platform: platform,
            timestamp: timestamp,
            shared_id: shared_id
        },
        ConditionExpression: "attribute_exists(id)"
    };
    if (Array.isArray(globalExcludes)) {
        (item.Item as Record<string, unknown>).globalExcludes = globalExcludes;
    }
    return item;
}


const getAccountLinkItemByToken = async (token: string): Promise<AccountLinkItem | null> => {
    return documentClient.send(new GetCommand({
        TableName: property.ACCOUNT_LINK_TABLE,
        Key: {
            token: token
        }
    })).then(item => {
        if (item.Item) {
            const resultItem : AccountLinkItem = {
                token: item.Item.token,
                user_id: item.Item.user_id,
                state: item.Item.state,
                redirect_url: item.Item.redirect_url,
                TTL: item.Item.TTL
            };
            return resultItem;
        }
        logger.error(`account link item not found, token=${token}`);
        return null;
    }).catch(err => {
        logger.error(err);
        return null;
    });
}

const putAccountLinkItem = async (accountLinkItem: AccountLinkItem): Promise<boolean> => {
    return documentClient.send(new PutCommand({
        TableName: property.ACCOUNT_LINK_TABLE,
        Item: accountLinkItem
    })).then(() => {
        logger.info("put AccountLinkItem: "+JSON.stringify(accountLinkItem));
        return true;
    }).catch(err => {
        logger.error(err);
        return false;
    });
}

const deleteAccountLinkItemByToken = async(token: string): Promise<boolean>=>{
    return await documentClient.send(new DeleteCommand({
        TableName: property.ACCOUNT_LINK_TABLE,
        Key:{
            token: token
        }
    })).then(_=>{return true}).catch((e: any)=>{
        logger.error(e);
        return false;
    });
}

const getTrashScheduleByUserId = async (user_id: string): Promise<TrashScheduleItem | null> => {
    return documentClient.send(new GetCommand({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        }
    })).then(item=>{
        if(item.Item) {
            return {
                id: item.Item.id,
                description: item.Item.description,
                globalExcludes: item.Item.globalExcludes,
                platform: item.Item.platform,
                timestamp: item.Item.timestamp,
                shared_id: item.Item.shared_id
            }
        }
        logger.error(`user id not found ${user_id}`)
        return null;
    }).catch((e: any) => {
        logger.error("failed get trash schedule")
        logger.error(e);
        return null;
    });
}

const setSharedIdToTrashSchedule = async(user_id: string, shared_id: string): Promise<boolean> => {
    return documentClient.send(new UpdateCommand({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        },
        UpdateExpression: "set #shared_id = :shared_id",
        ExpressionAttributeNames: {"#shared_id": "shared_id"},
        ExpressionAttributeValues: {":shared_id": shared_id}
    })).then(_=>true).catch((err)=>{
        logger.error("failed update trash schedule");
        logger.error(err);
        return false;
    })

}

const putSharedSchedule = async(shared_id: string, schedule: TrashScheduleItem): Promise<boolean> => {
    const item: Record<string, unknown> = {
        shared_id: shared_id,
        description: schedule.description,
        timestamp: schedule.timestamp
    };
    if (Array.isArray(schedule.globalExcludes)) {
        item.globalExcludes = schedule.globalExcludes;
    }
    return documentClient.send(new PutCommand({
        TableName: property.SHARED_SCHEDULE_TABLE,
        Item: item
    })).then(_=>true).catch((err)=>{
        logger.error("failed put shared schedule");
        logger.error(err);
        return false;
    });
}

const getSharedScheduleBySharedId = async(shared_id: string): Promise<SharedScheduleItem|null> => {
    return documentClient.send(new GetCommand({
        TableName: property.SHARED_SCHEDULE_TABLE,
        Key: {
            shared_id: shared_id
        }
    })).then((value)=>{
        if(value.Item) {
            return {
               shared_id: value.Item.shared_id ,
               description: value.Item.description,
               globalExcludes: value.Item.globalExcludes,
               timestamp: value.Item.timestamp
            }
        }
        return null;
    }).catch((err)=>{
        logger.error("failed get shared schedule");
        logger.error(err)
        return null;
    });
}

const putActivationCode = async(activationCodeItem: ActivationCodeItem): Promise<boolean> => {
    return await documentClient.send(new PutCommand({
        TableName: property.ACTIVATE_TABLE,
        Item: {
            code: activationCodeItem.code,
            shared_id: activationCodeItem.shared_id,
            TTL: activationCodeItem.TTL
        }
    })).then(_=>{return true}).catch(e=>{
        logger.error("failed put activation code");
        return false;
    });
}

const deleteActivationCode = async(code: string): Promise<boolean> => {
    return await documentClient.send(new DeleteCommand({
        TableName: property.ACTIVATE_TABLE,
        Key: {
            code: code
        }
    })).then(_=>{
        return true;
    }).catch((e: any)=>{
        logger.error("failed delete activation code");
        logger.error(e);
        return false;
    });
}

const getActivationCode = async(code: string): Promise<ActivationCodeItem | null>=> {
    return await documentClient.send(new GetCommand({
        TableName: property.ACTIVATE_TABLE,
        Key: {
            code: code
        }
    })).then(item=>{
        if(item.Item) {
            return {
                code: item.Item.code,
                shared_id: item.Item.shared_id,
                TTL: item.Item.TTL
            }
        }
        return null;
    }).catch((e: any)=>{
        logger.error("failed get activation code");
        logger.error(e);
        return null;
    });
}

const insertTrashSchedule = async(trashScheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    const item: Record<string, unknown> = {
        id: trashScheduleItem.id,
        description: trashScheduleItem.description,
        platform: trashScheduleItem.platform,
        timestamp: timestamp
    };
    if (Array.isArray(trashScheduleItem.globalExcludes)) {
        item.globalExcludes = trashScheduleItem.globalExcludes;
    }
    return documentClient.send(new PutCommand({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: item,
        ConditionExpression: "attribute_not_exists(id)"
    })).then(_=>{return true}).catch((e: any)=>{
       logger.error(e);
       return false;
    });
}

const putExistTrashSchedule = async(trashScheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    const item: Record<string, unknown> = {
        id: trashScheduleItem.id,
        description: trashScheduleItem.description,
        platform: trashScheduleItem.platform,
        timestamp: timestamp,
        shared_id: trashScheduleItem.shared_id
    };
    if (Array.isArray(trashScheduleItem.globalExcludes)) {
        item.globalExcludes = trashScheduleItem.globalExcludes;
    }
    return documentClient.send(new PutCommand({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Item: item,
        ConditionExpression: "attribute_exists(id)"
    })).then(_=>{return true}).catch((e: any)=>{
       logger.error(e);
       return false;
    });
}

const updateTrashSchedule = async(user_id: string, description: string, timestamp: number, globalExcludes?: TrashScheduleItem["globalExcludes"]): Promise<boolean> =>{
    const expressionAttributeNames: Record<string, string> = {
        "#description": "description",
        "#timestamp": "timestamp"
    };
    const expressionAttributeValues: Record<string, unknown> = {
        ":description": description,
        ":timestamp": timestamp
    };
    let updateExpression = "set #description = :description, #timestamp = :timestamp";
    if (Array.isArray(globalExcludes)) {
        expressionAttributeNames["#globalExcludes"] = "globalExcludes";
        expressionAttributeValues[":globalExcludes"] = globalExcludes;
        updateExpression += ", #globalExcludes = :globalExcludes";
    }
    return documentClient.send(new UpdateCommand({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: "attribute_exists(id)"
    })).then(_=>true).catch((err)=> {
        logger.error("failed update trash schedule");
        logger.error(err);
        return false;
    });
}

const putAuthorizationCode = async(codeItem: CodeItem): Promise<boolean> =>{
    return documentClient.send(new PutCommand({
        TableName: property.AUTHORIZE_TABLE,
        Item: codeItem,
        ConditionExpression: "attribute_not_exists(code)"
    })).then(_ => {
        return true;
    }).catch(err => {
        logger.warn(err);
        return false;
    });
}

const transactionUpdateScheduleAndSharedSchedule = async(shared_id: string, scheduleItem: TrashScheduleItem, timestamp: number): Promise<boolean> => {
    return documentClient.send(new TransactWriteCommand({
        TransactItems: [
            {
                Put: SharedSchedulePutOperation(shared_id, scheduleItem.description, timestamp, scheduleItem.globalExcludes),
            },
            {
                Put: ExistTrashScheduleWithSharedIdPutOperation(scheduleItem.id, scheduleItem.description, scheduleItem.platform || "web", timestamp, shared_id, scheduleItem.globalExcludes)
            }
        ]
    })).then(_=> true).catch((err)=>{
        logger.error("failed transaction update schedule");
        logger.error(err);
        return false;
    })
}

const updateTrashScheduleTimestamp = async(user_id: string, timestamp: number): Promise<boolean> => {
    return documentClient.send(new UpdateCommand({
        TableName: property.TRASH_SCHEDULE_TABLE,
        Key: {
            id: user_id
        },
        UpdateExpression: "set #timestamp = :timestamp",
        ExpressionAttributeNames: {
            "#timestamp": "timestamp"
        },
        ExpressionAttributeValues: {
            ":timestamp": timestamp
        }
    })).then(_=>true).catch(err=>{
        logger.error("failed update TrashSchedule timestamp");
        logger.error(err);
        return false;
    });
}

export default {
    putAccountLinkItem: putAccountLinkItem,
    getAccountLinkItemByToken: getAccountLinkItemByToken,
    deleteAccountLinkItemByToken: deleteAccountLinkItemByToken,
    getTrashScheduleByUserId: getTrashScheduleByUserId,
    putActivationCode: putActivationCode,
    deleteActivationCode: deleteActivationCode,
    getActivationCode: getActivationCode,
    insertTrashSchedule: insertTrashSchedule,
    putExistTrashSchedule: putExistTrashSchedule,
    updateTrashSchedule: updateTrashSchedule,
    putAuthorizationCode: putAuthorizationCode,
    setSharedIdToTrashSchedule: setSharedIdToTrashSchedule,
    putSharedSchedule: putSharedSchedule,
    getSharedScheduleBySharedId: getSharedScheduleBySharedId,
    transactionUpdateScheduleAndSharedSchedule: transactionUpdateScheduleAndSharedSchedule,
    updateTrashScheduleTimestamp: updateTrashScheduleTimestamp
}
