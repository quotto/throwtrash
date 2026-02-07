import * as common from "trash-common";
import db from "./dbadapter.js"
import {BackendResponse, SessionItem} from "./interface.js"
import property from "./property.js"
export default async(session: SessionItem): Promise<BackendResponse>=>{
    const endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    const google_state = common.generateRandomCode(20);
    const option = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        response_type:"code",
        scope:"openid profile",
        redirect_uri:`${property.AUTHORIZATION_URL}/signin?service=google`,
        state: google_state,
        login_hint: "mythrowaway.net@gmail.com",
        nonce: common.generateRandomCode(16)
    };
    const params_array = [];
    for(let [key, value] of Object.entries(option)) {
        params_array.push(`${key}=${value}`);
    }
    session.googleState = google_state;
    await db.saveSession(session);
    return {
        statusCode: 301,
        headers: {
            "Cache-Control": "no-store",
            Location: endpoint + "?" + params_array.join("&")
        }
    }
};
