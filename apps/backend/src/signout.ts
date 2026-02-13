import { getLogger } from "trash-common";
const logger = getLogger();
import db from "./dbadapter.js"
export default async(session: any)=>{
    if(session.userInfo) {
        logger.info("signout:"+session.userInfo.signinId);
        session.userInfo = undefined;
        await db.saveSession(session);
        return {
            statusCode: 200,
            body: "signout"
        }
    }
    logger.warn("not signed in user");
    return {
        statusCode: 200,
        body: ""
    }
}
