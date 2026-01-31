export declare class Logger {
    constructor();
    private mLevel;
    setLevel_ERROR(): void;
    setLevel_WARN(): void;
    setLevel_INFO(): void;
    setLevel_DEBUG(): void;
    error(message: string): boolean;
    warn(message: string): boolean;
    info(message: string): boolean;
    debug(message: string): boolean;
}
export declare function getLogger(): Logger;
