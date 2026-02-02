const ERROR = "0";
const WARN = "1";
const INFO = "2";
const DEBUG = "3";

export class Logger {
  constructor() {
    console.log("Logger initialize");
  }
  private mLevel = INFO;
  setLevel_ERROR(): void {
    this.mLevel = ERROR;
  }
  setLevel_WARN(): void {
    this.mLevel = WARN;
  }
  setLevel_INFO(): void {
    this.mLevel = INFO;
  }
  setLevel_DEBUG(): void {
    this.mLevel = DEBUG;
  }
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

const singleLogger = new Logger();
export function getLogger(): Logger {
  return singleLogger;
}

export function isNotEmpty(value: string | number | undefined | null): boolean {
  return typeof value !== "undefined" && value !== null && String(value).length > 0;
}

export function isNumber(value: string | number): boolean {
  return !Number.isNaN(Number(value));
}

export function isNotLessMin(value: number, min = 1): boolean {
  return value >= min;
}

export function isNotOverMax(value: number, max = 31): boolean {
  return value <= max;
}

export function isNotOverLength(value: string, max = 10): boolean {
  return value.length <= max;
}

export function isValidTrashVal(value: string): boolean {
  const re = /^[A-z0-9Ａ-ｚ０-９ぁ-んァ-ヶー一-龠\s]+$/;
  return isNotEmpty(value) && re.exec(value) !== null;
}

export function isValidMonthValue(month_val: string | number): boolean {
  const date = Number(month_val);
  return isNotEmpty(date) && isNumber(date) && isNotLessMin(date) && isNotOverMax(date);
}

export function isValidTrashType(trash: { type: string; trash_val?: string }, maxlength: number): boolean {
  return (
    trash.type !== "other" ||
    (isNotEmpty(trash.trash_val ?? "") &&
      isValidTrashVal(trash.trash_val ?? "") &&
      isNotOverLength(trash.trash_val ?? "", maxlength))
  );
}

export function existSchedule(schedules: Array<{ type: string }>): boolean {
  return schedules && schedules.length > 0 && schedules.every((element) => element.type !== "none");
}

export function checkTrashes(
  trashes: Array<{ schedules: Array<{ type: string; value: string | { weekday: string; start: string; interval?: number } }>; type: string; trash_val?: string }>,
  globalExcludes: Array<{ month: number; date: number }> = []
): boolean {
  if (globalExcludes.length > 10) {
    return false;
  }
  const hasInvalidExclude = globalExcludes.some((exclude) => {
    if (exclude.month < 1 || exclude.month > 12) return true;
    if (exclude.date < 1) return true;
    if (exclude.month === 2) return exclude.date > 29;
    if ([1, 3, 5, 7, 8, 10, 12].includes(exclude.month)) return exclude.date > 31;
    return exclude.date > 30;
  });
  if (hasInvalidExclude) {
    return false;
  }
  return (
    trashes &&
    trashes.length > 0 &&
    trashes.every((trash) =>
      trash.schedules &&
      trash.schedules.every((schedule) => {
        if (schedule.type === "month") {
          return isValidMonthValue(schedule.value as string);
        }
        return true;
      }) &&
      existSchedule(trash.schedules) &&
      isValidTrashType(trash, 10)
    )
  );
}

export function generateUUID(separator = ""): string {
  let uuid = "";
  for (let i = 0; i < 32; i++) {
    const random = (Math.random() * 16) | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += separator;
    }
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
  }
  return uuid;
}

export function generateRandomCode(length = 10): string {
  let code = "";
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * 63)];
  }
  return code;
}
