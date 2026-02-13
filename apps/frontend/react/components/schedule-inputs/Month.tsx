import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, isError } from '../common';
import { MainProps } from '../../types/props';
import { Schedule } from '../../../app/states/types';

type Props = {
    trash_index: number;
    schedule_index: number;
    target_schedule: Schedule;
    onChangeInput: MainProps['onChangeInput'];
};

export default function Month(props: Props) {
    const { t } = useTranslation();
    const { trash_index, schedule_index, target_schedule, onChangeInput } = props;
    return (
        <TextField
            id={`scinput-${trash_index}-${schedule_index}`}
            name={`scinput-${trash_index}-${schedule_index}`}
            label={t('TrashSchedule.input.month.label')}
            type="number"
            placeholder={t('TrashSchedule.input.month.placeholder')}
            required
            value={target_schedule.value}
            onChange={(e) => onChangeInput(trash_index, schedule_index, e.target.value)}
            sx={{
                display: 'inline-block',
                verticalAlign: 'top',
                width: { xs: '50%', sm: '40%' },
                minWidth: 130,
                maxWidth: 210
            }}
            inputProps={{ style: { textAlign: 'center', width: '100%' } }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position='end'>{t('TrashSchedule.input.month.suffix')}</InputAdornment>
                )
            }}
            InputLabelProps={{ shrink: true }}
            error={isError(target_schedule.error)}
            helperText={getErrorMessage(t, target_schedule.error)}
        />
    );
}
