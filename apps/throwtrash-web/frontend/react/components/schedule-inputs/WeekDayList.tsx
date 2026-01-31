import React, { ReactNode } from 'react';
import { MenuItem } from '@mui/material';

const WeekdayType =  ['0','1','2','3','4','5','6'];
export function WeekDayList(t: Function) {
    let WeekDayList: ReactNode[] = [];
    WeekdayType.map((key) => {
        WeekDayList.push(
            <MenuItem key={key} value={key}>
                {t('TrashSchedule.select.weekday.option.' + key)}
            </MenuItem>
        );
    });
    return WeekDayList;
}

export function BiWeekList(t: Function) {
    let BiWeekList: ReactNode[] = [];
    WeekdayType.forEach((key) => {
        for (let num = 1; num <= 5; num++) {
            BiWeekList.push(
                <MenuItem key={key + '-' + num} value={key + '-' + num}>
                    {t('TrashSchedule.select.weekday.number.' + num) + t('TrashSchedule.select.weekday.option.' + key)}
                </MenuItem>
            );
        }
    });
    return BiWeekList;
}