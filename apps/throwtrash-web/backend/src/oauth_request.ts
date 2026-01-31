import db from "./dbadapter.js"
import property from "./property.js"
import error_def from "./error_def.js"
import {BackendResponse, SessionItem} from "./interface.js"

export default async (params: any,session: SessionItem,new_flg: boolean): Promise<BackendResponse>=> {
    if(params && params.state && params.client_id && params.redirect_uri && params.platform) {
        session.state = params.state;
        session.client_id = params.client_id;
        session.redirect_uri = params.redirect_uri;
        session.platform = params.platform;

        if(await db.saveSession(session)) {
            const response: BackendResponse =  {
                statusCode: 301,
                headers: {
                    Location: `${property.FRONTEND_URL}/index.html`
                }
            };
            if(new_flg) {
               response.headers!["Set-Cookie"] = `${property.SESSIONID_NAME}=${session.id};max-age=${property.SESSION_MAX_AGE};Path=/;SameSite=None;Secure;HttpOnly;`;
            }
            return response;
        }
        return error_def.ServerError;

    }
    return error_def.UserError;
};
