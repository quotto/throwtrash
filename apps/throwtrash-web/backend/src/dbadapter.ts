import property from "./property.js"
import * as common from "trash-common";
import type { TrashSchedulePayload } from "./types.js";
const logger = common.getLogger();
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
const dynamoClient = new DynamoDBClient({ region: process.env.DB_REGION });
let documentClient = DynamoDBDocumentClient.from(dynamoClient);

export const setDocumentClient = (client: DynamoDBDocumentClient) => {
    documentClient = client;
};
import {initializeApp,applicationDefault} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
initializeApp({
    credential: applicationDefault()
});
const firestore = getFirestore();
import crypto from "crypto";
import { AccessTokenItem, CodeItem, RawTrasScheduleItem, RefreshTokenItem, SessionItem } from "./interface.js"


const toHash = (value: string): string => {
    return crypto.createHash("sha512").update(value).digest("hex");
}

const getRefreshToken = async(refresh_token: string): Promise<RefreshTokenItem | undefined> => {
    const result = await documentClient.send(new GetCommand({
        TableName: property.REFRESH_TABLE,
        Key: {
            refresh_token: toHash(refresh_token)
        }
    }));
    logger.debug("Get RefreshToken:" + JSON.stringify(result));
    return result.Item? result.Item as RefreshTokenItem : undefined;
}

const putAccessToken = async(user_id: string,client_id: string,expires_in: number): Promise<string>=>{
    let limit = 0;
    while(limit < 5) {
        const accessToken = common.generateRandomCode(32);
        const key =  toHash(accessToken);
        const accessTokenItem: AccessTokenItem = {
            expires_in: Math.ceil((Date.now()/1000))+expires_in,
            user_id: user_id,
            client_id: client_id
        }
        try {
            if(client_id === process.env.ALEXA_USER_CLIENT_ID) {
                accessTokenItem.access_token = key;
                const result = await documentClient.send(new PutCommand({
                    TableName: property.TOKEN_TABLE,
                    Item: accessTokenItem,
                    ConditionExpression: "attribute_not_exists(access_token)"
                }));
                logger.debug(`DynamoDBWriteResult -> ${JSON.stringify(result,null,2)}`)
                return accessToken;
            } else if(client_id === process.env.GOOGLE_USER_CLIENT_ID) {
                const result = await firestore.collection(property.TOKEN_TABLE).doc(key).create(accessTokenItem);
                logger.debug(`FirestoreWriteResult -> ${JSON.stringify(result.writeTime,null,2)}`)
                return accessToken;
            }
            // client_idが一致しない場合はループを抜けて例外処理
            logger.error(`putAccessToken failed,Invalid ClientID -> ${client_id}`)
            break;
        } catch(err: any) {
            logger.warn(err);
        }
        limit++;
    }
    throw new Error("Put Access Token Failed.");
}

const putRefreshToken = async(user_id: string,client_id: string,expires_in: number): Promise<string>=>{
    let limit = 0;
    while(limit < 5) {
        const refreshToken = common.generateRandomCode(32);
        try {
            await documentClient.send(new PutCommand({
                TableName: property.REFRESH_TABLE,
                Item: {
                    refresh_token: toHash(refreshToken),
                    expires_in: Math.ceil(Date.now()/1000) + expires_in,
                    user_id: user_id,
                    client_id: client_id
                },
                ConditionExpression: "attribute_not_exists(refresh_token)"
            }));
            logger.debug(`Put RefreshToken:${refreshToken}`);
            return refreshToken;
        } catch(err: any) {
            logger.warn(err);
        }
        limit++;
    }
    throw new Error("Put Refresh Token Failed.");
}
const saveSession = async (session: SessionItem): Promise<boolean> => {
    session.expire = Math.ceil(Date.now()/1000) + property.SESSION_MAX_AGE;
    return documentClient.send(new PutCommand({
        TableName: property.SESSION_TABLE,
        Item: session
    })).then(() => {
        logger.info("save session"+JSON.stringify(session));
        return true;
    }).catch(err => {
        logger.error(err);
        return false;
    });
}

const getDataBySigninId = async(signinId: string): Promise<RawTrasScheduleItem | {}>=>{
    logger.debug("get data by signinId:"+signinId);
    return documentClient.send(new QueryCommand({
        TableName: property.SCHEDULE_TABLE,
        IndexName: "signinId-index",
        ExpressionAttributeNames: { "#i": "signinId" } ,
        ExpressionAttributeValues: { ":val": signinId },
        KeyConditionExpression: "#i = :val"
    })).then((data)=>{
        if(data.Count && data.Count > 0) {
            logger.debug("get data"+JSON.stringify(data.Items![0]));
            return data.Items![0] as RawTrasScheduleItem;
        }
        return {};
    }).catch(err=>{
        logger.error(err);
        throw new Error("Get Data Failed");
    });
}

const deleteSession = async(sessionId: string): Promise<boolean>=>{
    await documentClient.send(new DeleteCommand({
        TableName: property.SESSION_TABLE,
        Key:{
            id: sessionId
        }
    }));
    return true;
}

const getAuthorizationCode = async(code: string): Promise<CodeItem | undefined>=>{
    const result = await documentClient.send(new GetCommand({
        TableName: property.AUTHORIZE_TABLE,
        Key: {
            code: code
        }
    }));
    return result.Item? result.Item as CodeItem : undefined;
}

const putAuthorizationCode = async(user_id:string ,client_id: string,redirect_uri: string, expires_in: number): Promise<CodeItem> =>{
    let limit = 0;
    while(limit < 5) {
        const codeItem: CodeItem = {
            code: common.generateRandomCode(),
            user_id: user_id,
            client_id: client_id,
            redirect_uri: redirect_uri,
            expires_in: Math.ceil(Date.now() / 1000 + expires_in)
        };
        try {
            await documentClient.send(new PutCommand({
                TableName: property.AUTHORIZE_TABLE,
                Item: codeItem,
                ConditionExpression: "attribute_not_exists(code)"
            }));
            return codeItem;
        } catch(err: any) {
            logger.warn(err);
        }
        limit++;
    }
    throw new Error("Put Authorization Code Failed(Over limit)");
}

const deleteAuthorizationCode = async(code: string): Promise<boolean> => {
    try {
        const deleteData = await documentClient.send(new DeleteCommand({
            TableName: property.AUTHORIZE_TABLE,
            Key: {
                code: code
            }
        }));
        logger.debug(`Delete Authorization Code -> ${JSON.stringify(deleteData)}`);
        return true;
    } catch(err: any) {
        logger.error(err);
    }
    throw new Error("Delete Authorization Code Failed.");
}

const putTrashSchedule = async(item: any, regist_data: TrashSchedulePayload ): Promise<boolean> =>{
    const params = {
        TableName: property.SCHEDULE_TABLE,
        Item: item
    };
    logger.debug("regist parameter:"+JSON.stringify(params));
    await documentClient.send(new PutCommand(params));
    logger.info(`Regist user(${JSON.stringify(item)})`);

    // Googleアシスタントの登録はfirestore登録後にリダイレクトする
    if (item.platform === "google") {
        logger.debug(`regist firestore: ${item.id},${JSON.stringify(regist_data)}`);
        await firestore.collection("schedule").doc(item.id).set({
            data: regist_data
        });
    }
    return true;
}

const publishId = async(): Promise<string> =>{
    let user_id: string|null = null;
    // 初回登録は最大5回まで重複のないIDの採番を試みる
    let retry = 0;
    while(retry < 5) {
        user_id = common.generateUUID("-");
        try {
            const result = await documentClient.send(new GetCommand({
                TableName: property.SCHEDULE_TABLE,
                Key: {
                    id: user_id
                }
            }));
            if(!result.Item) {
                logger.debug("generate new id:"+user_id);
                return user_id;
            }
            logger.warn("duplicate id:"+user_id);
            user_id = null;
            retry++;
        } catch(err: any) {
            logger.error(err);
        }
    }
    throw new Error("PublishId Failed(Over limit)");
}

const getSession = async(sessionId: string): Promise<SessionItem | null | undefined>=> {
    const params = {
        Key: {
            id: sessionId
        },
        TableName: property.SESSION_TABLE
    }
    return documentClient.send(new GetCommand(params)).then(async(data)=>{
        return data.Item as SessionItem;
    }).catch(error=>{
        logger.error("Failed getSession.");
        logger.error(error);
        return null;
    })
}

const publishSession = async(): Promise<SessionItem | null>=>{
    const new_session =  {
        id: common.generateRandomCode(20),
        expire: Math.ceil((new Date()).getTime() / 1000) + property.SESSION_MAX_AGE
    }
    logger.info("publish new session:"+ JSON.stringify(new_session));
    return documentClient.send(new PutCommand({
        TableName: property.SESSION_TABLE,
        Item: new_session,
        ConditionExpression: "attribute_not_exists(id)"
    })).then(()=>{
        return new_session;
    }).catch((e)=>{
        logger.error("Failed session value.")
        logger.error(e.message);
        return null;
    });
};

export default {
    saveSession: saveSession,
    publishId: publishId,
    publishSession: publishSession,
    putAccessToken: putAccessToken,
    putAuthorizationCode: putAuthorizationCode,
    putRefreshToken: putRefreshToken,
    putTrashSchedule: putTrashSchedule,
    deleteAuthorizationCode: deleteAuthorizationCode,
    deleteSession: deleteSession,
    getAuthorizationCode: getAuthorizationCode,
    getDataBySigninId: getDataBySigninId,
    getRefreshToken: getRefreshToken,
    getSession: getSession,
}
