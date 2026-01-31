const ERROR = '0';
const WARN = '1';
const INFO = '2';
const DEBUG = '3';

export class Logger {
    constructor() {console.log("Logger initialize") }
    private mLevel: string = INFO;
    setLevel_ERROR():void { this.mLevel = ERROR }
    setLevel_WARN():void { this.mLevel = WARN }
    setLevel_INFO():void { this.mLevel = INFO }
    setLevel_DEBUG():void { this.mLevel = DEBUG }
    error(message: string): boolean {
        if (this.mLevel >= ERROR) {
            console.error(message);
            return true;
        }
        return false;
    }
    warn(message: string): boolean {
        if (this.mLevel >= WARN) {
            console.warn(message);
            return true;
        }
        return false;
    }
    info(message: string): boolean {
        if (this.mLevel >= INFO) {
            console.info(message);
            return true;
        }
        return false;
    }
    debug(message: string): boolean {
        if (this.mLevel >= DEBUG) {
            console.debug(message);
            return true;
        }
        return false;
    }
}

export function getLogger(): Logger {
    return singleLogger;
}

const singleLogger = new Logger();
