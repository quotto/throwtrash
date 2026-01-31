import * as common from "../index.mjs";
const logger = common.getLogger();
export const loggerTest = ()=>{
    return logger.debug("debug");
}