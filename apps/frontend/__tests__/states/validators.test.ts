import {
    input_month_check,
    input_trash_type_check,
    schedule_exist,
    exist_error,
    validate_excludes
} from '../../app/states/validators';

describe('validators (common_check parity)', () => {
    test('input_month_check detects invalid month', () => {
        expect(input_month_check('')).toBe('missingvalue');
        expect(input_month_check('0')).toBe('wrongminnumber');
        expect(input_month_check('32')).toBe('wrongmaxnumber');
        expect(input_month_check('10')).toBeUndefined();
    });

    test('input_trash_type_check enforces length and charset for other type', () => {
        const base = { type: 'other', trash_val: 'abc', schedules: [], excludes: [] };
        expect(input_trash_type_check({ ...base, trash_val: '' } as any)).toBe('missingvalue');
        expect(input_trash_type_check({ ...base, trash_val: 'abc😊' } as any)).toBe('wrongcharacter');
        expect(input_trash_type_check({ ...base, trash_val: 'a'.repeat(11) } as any, 10)).toBe('wronglengthstring');
        expect(input_trash_type_check(base as any, 10)).toBeUndefined();
    });

    test('schedule_exist requires at least one non-none', () => {
        expect(schedule_exist([{ type: 'none', value: '' } as any])).toBe('missingschedule');
        expect(schedule_exist([{ type: 'weekday', value: '0' } as any])).toBeUndefined();
    });

    test('exist_error true when any schedule invalid or missing', () => {
        const trash = {
            type: 'burn',
            trash_val: '',
            schedules: [{ type: 'month', value: '' }],
            excludes: []
        };
        expect(exist_error([trash as any])).toBeTruthy();
        trash.schedules = [{ type: 'weekday', value: '0' }];
        expect(exist_error([trash as any])).toBeFalsy();
    });

    test('validate_excludes checks month days', () => {
        expect(validate_excludes([{ month: 2, date: 30 }])).toBe(false);
        expect(validate_excludes([{ month: 2, date: 29 }])).toBe(true);
        expect(validate_excludes([{ month: 11, date: 31 }])).toBe(false);
        expect(validate_excludes([{ month: 12, date: 31 }])).toBe(true);
    });
});
