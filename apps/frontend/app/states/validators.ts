// 現行 reducers/common_check.ts と等価なバリデーション。挙動を変えないこと。
import { Schedule, Trash } from './types';

export const required = (value: string | boolean | undefined) =>
    value ? undefined : 'missingvalue';

export const number = (value: string | number | undefined) =>
    value && isNaN(Number(value)) ? 'wrongnumber' : undefined;

export const minValue = (value: number, min = 1) =>
    value < min ? 'wrongminnumber' : undefined;

export const maxValue = (value: number, max = 31) =>
    value && value > max ? 'wrongmaxnumber' : undefined;

export const maxLen = (value: string, max = 10) =>
    value.length > max ? 'wronglengthstring' : undefined;

export const trashtype_regex = (value: string) => {
    const re = /^[A-z0-9Ａ-ｚ０-９ぁ-んァ-ヶー一-龠\s]+$/;
    return re.exec(value) ? undefined : 'wrongcharacter';
};

export const input_month_check = (month_val: string) => {
    let error = undefined;
    error =
        required(month_val) ||
        number(month_val) ||
        minValue(Number(month_val)) ||
        maxValue(Number(month_val));
    return error;
};

export const input_trash_type_check = (trash: Trash, maxlength = 10) => {
    if (trash.type === 'other') {
        return (
            required(trash.trash_val) ||
            trashtype_regex(trash.trash_val) ||
            maxLen(trash.trash_val, maxlength)
        );
    }
    return undefined;
};

export const schedule_exist = (schedules: Schedule[]) => {
    const result = schedules.some((element) => element.type !== 'none');
    return result ? undefined : 'missingschedule';
};

export const exist_error = (trashes: Trash[]) => {
    try {
        return (
            trashes.length === 0 ||
            trashes.some((trash) => {
                return (
                    trash.schedules.some((schedule) => {
                        if (schedule.type === 'month') {
                            return input_month_check(schedule.value as string);
                        }
                        return schedule.error;
                    }) ||
                    schedule_exist(trash.schedules) ||
                    input_trash_type_check(trash)
                );
            })
        );
    } catch (err) {
        console.error(err);
        return true;
    }
};

export const validate_excludes = (excludes: { month: number; date: number }[]) => {
    return excludes.every((value) => {
        if (value.month >= 1 && value.month <= 12 && value.date >= 1) {
            if (
                (value.month === 2 && value.date <= 29) ||
                ([1, 3, 5, 7, 8, 10, 12].includes(value.month) && value.date <= 31) ||
                ([4, 6, 9, 11].includes(value.month) && value.date <= 30)
            ) {
                return true;
            }
        }
        return false;
    });
};

export const validate_excludes_with_limit = (excludes: { month: number; date: number }[], max = 10) => {
    if (excludes.length > max) {
        return false;
    }
    return validate_excludes(excludes);
};
