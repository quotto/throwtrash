import React from 'react';
import { FormControl, InputLabel, Select, TextField, MenuItem, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WeekDayList } from './WeekDayList';
import { MainProps } from '../../types/props';
import { Schedule, EvWeek as EvWeekType } from '../../../app/states/types';

type Props = {
    trash_index: number;
    schedule_index: number;
    target_schedule: Schedule;
    onChangeInput: MainProps['onChangeInput'];
};

export default function EvWeek(props: Props) {
    const { t } = useTranslation();
    const { trash_index, schedule_index, target_schedule, onChangeInput } = props;
    const evweek_value = target_schedule.value as EvWeekType;

    return (
        <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
            <FormControl sx={{ textAlign: 'center', mr: 1, mb: 1, minWidth: 140, flexGrow: 1 }}>
                <InputLabel htmlFor={`interval-${trash_index}-${schedule_index}`}>{t('TrashSchedule.select.evweek.interval')}</InputLabel>
                <Select
                    id={`interval-${trash_index}-${schedule_index}`}
                    name={`interval-${trash_index}-${schedule_index}`}
                    label={t('TrashSchedule.select.evweek.interval')}
                    value={evweek_value.interval}
                    onChange={(e) => onChangeInput(trash_index, schedule_index, { weekday: evweek_value.weekday, start: evweek_value.start, interval: e.target.value as number })}
                >
                    {[2, 3, 4].map((value, index) => (
                        <MenuItem key={value} value={value}>
                            {t(`TrashSchedule.select.evweek.intervalValue.${index}`)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl sx={{ textAlign: 'center', mr: 1, mb: 1, minWidth: 140, flexGrow: 1 }}>
                <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>{t('TrashSchedule.select.weekday.label')}</InputLabel>
                <Select
                    id={`scinput-${trash_index}-${schedule_index}`}
                    label={t('TrashSchedule.select.weekday.label')}
                    name={`scinput-${trash_index}-${schedule_index}`}
                    value={evweek_value.weekday}
                    onChange={(e) => onChangeInput(
                        trash_index,
                        schedule_index,
                        { weekday: e.target.value as string, start: evweek_value.start, interval: evweek_value.interval }
                    )}
                >
                    {WeekDayList(t)}
                </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180, flexGrow: 1 }}>
                <TextField
                    id={`recently-${trash_index}-${schedule_index}`}
                    name={`recently-${trash_index}-${schedule_index}`}
                    label={t('TrashSchedule.select.evweek.helper')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ style: { textAlign: 'center' } }}
                    value={evweek_value.start}
                    onChange={(e) => onChangeInput(
                        trash_index,
                        schedule_index,
                        { weekday: evweek_value.weekday, start: e.target.value, interval: evweek_value.interval }
                    )}
                />
            </FormControl>
        </Stack>
    );
}
