const ERROR = '0';
const WARN = '1';
const INFO = '2';
const DEBUG = '3';
export class Logger {
    constructor() { console.log("Logger initialize"); }
    mLevel = INFO;
    setLevel_ERROR() { this.mLevel = ERROR; }
    setLevel_WARN() { this.mLevel = WARN; }
    setLevel_INFO() { this.mLevel = INFO; }
    setLevel_DEBUG() { this.mLevel = DEBUG; }
    error(message) {
        if (this.mLevel >= ERROR) {
            console.error(message);
            return true;
        }
        return false;
    }
    warn(message) {
        if (this.mLevel >= WARN) {
            console.warn(message);
            return true;
        }
        return false;
    }
    info(message) {
        if (this.mLevel >= INFO) {
            console.info(message);
            return true;
        }
        return false;
    }
    debug(message) {
        if (this.mLevel >= DEBUG) {
            console.debug(message);
            return true;
        }
        return false;
    }
}
export function getLogger() {
    return singleLogger;
}
const singleLogger = new Logger();
