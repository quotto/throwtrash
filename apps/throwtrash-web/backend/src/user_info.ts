import {BackendResponse} from "./interface.js"
import type { ExcludeDate, TrashData } from "trash-common";
import { SessionItem } from "./interface.js"

export default (session: SessionItem): BackendResponse =>{
    let body:{name: string,preset: TrashData[] | null, globalExcludes: ExcludeDate[]} = {
        name: "",
        preset: null,
        globalExcludes: []
    };
    if(session && session.userInfo && "name" in session.userInfo && "preset" in session.userInfo) {
        body.name = session.userInfo.name;
        body.preset = session.userInfo.preset;
        body.globalExcludes = session.userInfo.globalExcludes ?? [];
    }
    return {
        statusCode: 200,
        body: JSON.stringify(body)
    }
}
