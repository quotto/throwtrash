import { CodeItem, SKILL_STAGE } from "./interface.js"

import * as request from "request";
import * as common from "trash-common";
const logger = common.getLogger();
import db from "./dbadapter.js"
import rp from "request-promise";
import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyResultV2 } from "aws-lambda";
import error_def from "./error_def.js"

export default async(params: APIGatewayProxyEventQueryStringParameters,stage: string): Promise<APIGatewayProxyResultV2> => {
    logger.debug(`enable_skill parameters: ${JSON.stringify(params)}`);
    if(
        params.code === null || typeof(params.code) === "undefined" ||
        params.token === null || typeof(params.token) === "undefined" ||
        params.redirect_uri === null || typeof(params.redirect_uri) === "undefined") {
        logger.error("parameter not contains token or code or redirect_uri");
        return error_def.UserError;
    }
    const accountLinkItem = await db.getAccountLinkItemByToken(params.token);
    logger.debug(`get accountlink item: ${JSON.stringify(accountLinkItem)}`);
    if(accountLinkItem === null || params.state != accountLinkItem.state) {
        logger.error("invalid parameters");
        return error_def.UserError;
    }
    // Amazonのアクセストークンを取得する
    const options = {
        uri: "https://api.amazon.com/auth/o2/token",
        form: {
            grant_type: "authorization_code",
            code: params.code,
            client_id: process.env.ALEXA_CLIENT_ID,
            client_secret: process.env.ALEXA_CLIENT_SECRET,
            redirect_uri: params.redirect_uri
        },
        method: "POST",
        json: true
    }
    logger.debug(`Get amazon access token:\n${JSON.stringify(options)}`);

    try {
        const amazonAccessToken = await rp(options);
        logger.debug(`Response Amazon AccessToken${JSON.stringify(amazonAccessToken)}`);
        const alexaEndpoint = await rp({
            uri: "https://api.amazonalexa.com/v1/alexaApiEndpoint",
            headers: {
                Authorization: `Bearer ${amazonAccessToken.access_token}`
            },
            json: true
        });

        const authorizationOptions:request.RequiredUriUrl & rp.RequestPromiseOptions = {
            uri: `${process.env.AUTHORIZATION_ENDPOINT}/request_authorization_code?user_id=${accountLinkItem.user_id}&client_id=${process.env.ALEXA_USER_CLIENT_ID}&redirect_uri=${accountLinkItem.redirect_url}`,
            headers: {
                "x-api-key": process.env.BACKEND_API_KEY
            },
            method: "GET",
            json: true
        }
        const authorizationCodeResponse = await rp(authorizationOptions);
        logger.debug(`Response Authorization Code: ${JSON.stringify(authorizationCodeResponse)}`);


        const skill_stage = process.env.SKILL_STAGE as SKILL_STAGE;
        if (skill_stage != "development" && skill_stage != "live") {
            throw Error("SKILL_STAGE is invalid");
        }
        const enableSkillOptions = {
            uri: `https://${alexaEndpoint.endpoints[0]}/v1/users/~current/skills/${process.env.ALEXA_SKILL_ID}/enablement`,
            headers: {
                Authorization: `Bearer ${amazonAccessToken.access_token}`
            },
            json: true,
            method: "POST",
            body: {
                stage: skill_stage,
                accountLinkRequest: {
                    redirectUri: accountLinkItem.redirect_url,
                    authCode: authorizationCodeResponse.code,
                    type: "AUTH_CODE"
                }
            }
        }

        logger.debug(`Request Enable Skill: ${JSON.stringify(enableSkillOptions)}`);

        // Alexa APIエンドポイントにスキル有効化のリクエストを送信する
        // Alexa APIではサービス（今日のゴミ出し）にauthorization codeをつけてアクセストークンをリクエストする
        // 正常にアクセストークンが取得できれば200が戻る
        const skillResponse = await rp(enableSkillOptions);
        logger.debug(`Response Enable Skill: ${JSON.stringify(skillResponse)}`);

        await db.deleteAccountLinkItemByToken(accountLinkItem.token);
        const frontend_url = process.env.FRONTEND_URL || "https://apps.mythrowaway.net";

        return {
            statusCode: 301,
            headers: {
                Location: `${frontend_url}/accountlink-complete.html`
            }
        }
    } catch(err: any) {
        logger.error(err.stack || err);
        return error_def.ServerError;
    }
}