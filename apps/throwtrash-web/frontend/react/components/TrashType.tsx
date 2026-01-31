import React, { ReactNode } from 'react';
import { Box, MenuItem, FormControl, FormHelperText, TextField, FormLabel, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { isError, TrashTypeList } from './common';
import { MainProps } from '../types/props';

type Props = {
    number: number;
    trash: any;
    onChangeTrash: MainProps['onChangeTrash'];
    onInputTrashType: MainProps['onInputTrashType'];
};

export default function TrashType(props: Props) {
    const { t } = useTranslation();
    const getErrorMessage = (message_id?: string | boolean, params: (string | number)[] = []) => {
        let message = typeof message_id === 'string' ? t(`error.${message_id}`) : undefined;
        if (message) {
            params.forEach((p) => {
                message = message!.replace('%s', String(p));
            });
        }
        return message;
    };

    const options: ReactNode[] = TrashTypeList.map((key: string) => (
        <MenuItem key={key} value={key}>
            {t('TrashSchedule.select.trashtype.option.' + key)}
        </MenuItem>
    ));

    return (
        <Box sx={{ mb: 2 }}>
            <FormControl fullWidth>
                <FormLabel sx={{ transform: 'scale(0.75)', transformOrigin: 'top left' }}>
                    <span style={{ color: '#f50057' }}>
                        {t('TrashSchedule.select.trashtype.label') + (props.number + 1)}
                    </span>
                </FormLabel>
                <Select
                    id={`trash${props.number}`}
                    name={`trash${props.number}`}
                    value={props.trash.type}
                    onChange={(e) => { props.onChangeTrash(props.number, e.target.value as string, []); }}
                    sx={{ textAlign: 'center' }}
                >
                    {options}
                </Select>
                <FormHelperText error={isError(props.trash.trash_type_error)}>
                    {getErrorMessage(props.trash.trash_type_error)}
                </FormHelperText>
            </FormControl>
            {props.trash.type === 'other' && (
                <TextField
                    sx={{ mt: 1 }}
                    fullWidth
                    id={`othertrashtype${props.number}`}
                    name={`othertrashtype${props.number}`}
                    label={t('TrashSchedule.input.other.placeholder')}
                    required
                    inputProps={{
                        maxLength: t('TrashSchedule.input.other.maxlength'),
                        style: { textAlign: 'center' }
                    }}
                    InputLabelProps={{ shrink: true }}
                    value={props.trash.trash_val}
                    onChange={(e) => {
                        const max = Number(t('TrashSchedule.input.other.maxlength'));
                        props.onInputTrashType(props.number, e.target.value, isNaN(max) ? 10 : max);
                    }}
                    helperText={getErrorMessage(
                        props.trash.input_trash_type_error,
                        [t('TrashSchedule.input.other.maxlength')]
                    )}
                    error={isError(props.trash.input_trash_type_error)}
                />
            )}
        </Box>
    );
}
