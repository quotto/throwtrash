import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
import type { DBAdapter, ExcludeDate, TrashData, TrashSchedule } from "trash-common";

const dynamoClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.APP_REGION })
);

export class DynamoDBAdapter implements DBAdapter{
    getUserIDByAccessToken(access_token: string): Promise<string> {
            const hashkey = crypto.createHash("sha512").update(access_token).digest("hex")
            return dynamoClient.send(new GetCommand({
                TableName: "throwtrash-backend-accesstoken",
                Key: {
                    access_token: hashkey
                }
            })).then((data: GetCommandOutput)=>{
                if(data.Item) {
                    const currentTime = Math.ceil(Date.now() / 1000);
                    if(data.Item.expires_in > currentTime) {
                        return data.Item.user_id;
                    } else {
                        console.error(`AccessToken is expired -> accesstoken=${access_token},expire=${data.Item.expires_in}`);
                    }
                }
                console.error(`AccessToken is not found -> accesstoken=${access_token}`)
                // IDが見つからない場合はブランクを返す
                return "";
            }).catch((err:Error)=>{
                console.error(err);
                throw new Error("Failed getUserIDByAccessToken");
            })
    }
    getTrashSchedule(user_id: string): Promise<TrashSchedule> {
        const params = {
            TableName: "TrashSchedule",
            Key: {
                id: user_id
            }
        };
        return dynamoClient.send(new GetCommand(params)).then((data: GetCommandOutput) => {
            if (data.Item) {
                const checkedNextday = typeof(data.Item.nextdayflag) != "undefined" ? data.Item.nextdayflag : true;
                const description = data.Item.description;
                let trashData: TrashData[] = [];
                if (typeof description === "string") {
                    try {
                        const parsed = JSON.parse(description);
                        if (Array.isArray(parsed)) {
                            trashData = parsed;
                        }
                    } catch (err) {
                        console.error(err);
                    }
                } else if (Array.isArray(description)) {
                    trashData = description;
                }
                const globalExcludes: ExcludeDate[] = Array.isArray(data.Item.globalExcludes)
                    ? data.Item.globalExcludes
                    : [];
                return {
                    trashData: trashData,
                    checkedNextday: checkedNextday,
                    globalExcludes: globalExcludes
                }
            }
            console.error(`User Not Found(AccessToken: ${user_id})`);
            return {
                trashData: [],
                checkedNextday: false,
                globalExcludes: []
            }
        }).catch((err: Error) => {
            console.error(err)
            throw new Error("Failed GetTrashSchedule")
        })
    }

}
