import React from 'react';
import { FormHelperText, Select, FormControl, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../common';
import { BiWeekList } from './WeekDayList';
import { MainProps } from '../../types/props';
import { Schedule } from '../../../app/states/types';

type Props = {
    trash_index: number;
    schedule_index: number;
    target_schedule: Schedule;
    onChangeInput: MainProps['onChangeInput'];
};

export default function BiWeek(props: Props) {
    const { t } = useTranslation();
    const { trash_index, schedule_index, target_schedule, onChangeInput } = props;
    const error = typeof target_schedule.error !== 'undefined' && target_schedule.error.length > 0;
    return (
        <FormControl sx={{ display: 'inline-block', verticalAlign: 'top', width: { xs: '50%', sm: '40%' }, minWidth: 130, maxWidth: 210 }}>
            <InputLabel htmlFor={`scinput-${trash_index}-${schedule_index}`}>
                {t('TrashSchedule.select.weekday.label')}
            </InputLabel>
            <Select
                id={`scinput-${trash_index}-${schedule_index}`}
                label={t('TrashSchedule.select.weekday.label')}
                name={`scinput-${trash_index}-${schedule_index}`}
                value={target_schedule.value}
                onChange={(e) => onChangeInput(trash_index, schedule_index, e.target.value as string)}
                sx={{ width: '100%', textAlign: 'center' }}
            >
                {BiWeekList(t)}
            </Select>
            <FormHelperText error={error}>
                {getErrorMessage(t, target_schedule.error, [])}
            </FormHelperText>
        </FormControl>
    );
}
