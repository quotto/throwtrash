import { APIGatewayProxyEventQueryStringParameters, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import dbadapter from "./dbadapter.js"

export default async(params: APIGatewayProxyEventQueryStringParameters): Promise<APIGatewayProxyStructuredResultV2> => {

    if(typeof(params.user_id) != "undefined" && typeof(params.client_id) != "undefined" && typeof(params.redirect_uri) != "undefined") {
        const authorizationCode = await dbadapter.putAuthorizationCode(params.user_id,params.client_id,params.redirect_uri, 10 * 60);
        if(authorizationCode != null) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    code: authorizationCode.code
                })
            };
        } else {
            return {
                statusCode: 500
            }
        }
    }
    return {
        statusCode: 400
    }
}