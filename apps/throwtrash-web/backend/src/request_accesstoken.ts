import * as common from "trash-common";
const logger = common.getLogger();

import db from "./dbadapter.js"
import error_def from "./error_def.js"

import {BackendResponse} from "./interface.js"

const ACCESS_TOKEN_EXPIRE = 30 * 24 * 60 * 60;
const REFRESH_TOKEN_EXPIRE = 180 * 24 * 60 * 60;

export default async (params: any, authorization: string|undefined): Promise<BackendResponse> => {
    logger.debug(JSON.stringify(params));
    logger.debug(`Authorization -> ${authorization}`);
    if(!(params.client_id === process.env.ALEXA_USER_CLIENT_ID &&
        authorization === "Basic " + Buffer.from(`${params.client_id}:${process.env.ALEXA_USER_SECRET}`).toString("base64")) &&
        !(params.client_id === process.env.GOOGLE_USER_CLIENT_ID &&
            params.client_secret === process.env.GOOGLE_USER_SECRET)
    ) {
        logger.error(`Invalid parameter or authorization -> params=${JSON.stringify(params)},authorization=${authorization}`);
        return error_def.UserError
    }
    if (params.grant_type === "authorization_code") {
        try {
            const authorizationCode = await db.getAuthorizationCode(params.code);
            if (authorizationCode &&
                params.client_id === authorizationCode.client_id &&
                decodeURIComponent(params.redirect_uri) === authorizationCode.redirect_uri){
                    // アクセストークンの登録
                    const accessToken = db.putAccessToken(authorizationCode.user_id, params.client_id, ACCESS_TOKEN_EXPIRE);

                    // リフレッシュトークンの登録
                    const refreshToken =db.putRefreshToken(authorizationCode.user_id,params.client_id, REFRESH_TOKEN_EXPIRE);

                    // 使い終わった認可コードの削除
                    const deleteCode = db.deleteAuthorizationCode(params.code);

                    const result = await Promise.all([accessToken,refreshToken,deleteCode]);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({
                            access_token: result[0],
                            token_type: "bearer",
                            expires_in: ACCESS_TOKEN_EXPIRE,
                            refresh_token: result[1]
                        }),
                        headers: {
                            "Content-Type": "application/json;charset UTF-8",
                            "Cache-Control": "no-store"
                        }
                    }
            } else {
                logger.error(`Invalid Parameters: db-> ${JSON.stringify(authorizationCode)},params->${JSON.stringify(params)}`);
            }
        } catch(err: any) {
            logger.error(err);
            return error_def.ServerError;
        }
    } else if(params.grant_type === "refresh_token") {
        try {
            const user_info = await db.getRefreshToken(params.refresh_token);
            if(user_info && user_info.client_id === params.client_id) {
                const access_token = db.putAccessToken(user_info.user_id,params.client_id ,ACCESS_TOKEN_EXPIRE);
                const refresh_token = db.putRefreshToken(user_info.user_id, params.client_id, REFRESH_TOKEN_EXPIRE);
                const result = await Promise.all([access_token,refresh_token]);
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        access_token: result[0],
                        expires_in: ACCESS_TOKEN_EXPIRE,
                        refresh_token: result[1],
                        token_type: "bearer"
                    }),
                    headers: {
                        "Content-Type": "application/json;charset UTF-8",
                        "Cache-Control": "no-store"
                    }
                }
            } else {
                logger.error("Refresh Token Error");
                logger.error(JSON.stringify(user_info));
                logger.error(JSON.stringify(params));
            }
        } catch(err: any) {
            logger.error(err);
            return error_def.ServerError;
        }
    }
    return error_def.UserError
}