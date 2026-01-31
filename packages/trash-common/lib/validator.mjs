export function isNotEmpty(value) {
    return (typeof (value) != "undefined") && value != null && String(value).length > 0;
}
export function isNumber(value) {
    return !isNaN(Number(value));
}
export function isNotLessMin(value, min = 1) {
    return value >= min;
}
export function isNotOverMax(value, max = 31) {
    return value <= max;
}
export function isNotOverLength(value, max = 10) {
    return value.length <= max;
}
export function isValidTrashVal(value) {
    const re = /^[A-z0-9Ａ-ｚ０-９ぁ-んァ-ヶー一-龠\s]+$/;
    return isNotEmpty(value) && re.exec(value) != null;
}
export function isValidMonthValue(month_val) {
    const date = Number(month_val);
    return isNotEmpty(date) && isNumber(date) && isNotLessMin(date) && isNotOverMax(date);
}
export function isValidTrashType(trash, maxlength) {
    return trash.type != "other" || (isNotEmpty(trash.trash_val) && isValidTrashVal(trash.trash_val) && isNotOverLength(trash.trash_val, maxlength));
}
export function existSchedule(schedules) {
    return schedules && schedules.length > 0 && schedules.every((element) => {
        return element.type != "none";
    });
}
export function checkTrashes(trashes) {
    return trashes && (trashes.length > 0) && trashes.every((trash) => {
        return trash.schedules && trash.schedules.every((schedule) => {
            if (schedule.type === "month") {
                return isValidMonthValue(schedule.value);
            }
            return true;
        }) && existSchedule(trash.schedules) && isValidTrashType(trash, 10);
    });
}
export function generateUUID(separator = "") {
    let uuid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += separator;
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
}
export function generateRandomCode(length = 10) {
    let code = "";
    for (let i = 0; i < length; i++) {
        code += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"[Math.floor(Math.random() * 63)];
    }
    return code;
}
