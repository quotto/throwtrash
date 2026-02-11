import React from 'react';
import Link from 'next/link';
import { Box, Button, Stack, Typography, Checkbox, FormControlLabel, Tooltip, Divider } from '@mui/material';
import { NotInterested, Edit, Delete, Add } from '@mui/icons-material';
import { green } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';
import type { ExcludeDate, Trash } from '../../app/states/types';
import ErrorDialog from './ErrorDialog';
import GlobalExcludeSummary from './GlobalExcludeSummary';

export type TrashListProps = {
    trashes: Trash[];
    globalExcludes: ExcludeDate[];
    submit_error: boolean;
    submitting: boolean;
    showErrorDialog?: boolean;
    nextday_checked?: boolean;
    onAddTrash: () => void;
    onDeleteTrash: (index: number) => void;
    onSubmit: () => void;
    onError: (open: boolean) => void;
    onChangeNextdayCheck: (checked: boolean) => void;
};

const MAX_TRASH = 10;

const trashDisplayName = (trash: Trash, t: (key: string, opts?: any) => string) => {
    if (trash.type === 'other' && trash.trash_val) {
        return trash.trash_val;
    }
    return t(`TrashSchedule.select.trashtype.option.${trash.type}`, { defaultValue: trash.type });
};

export default function TrashList(props: TrashListProps) {
    const { t } = useTranslation();
    const canDelete = props.trashes.length > 1;
    const canAdd = props.trashes.length < MAX_TRASH;

    return (
        <Box sx={{ flexBasis: '90%', width: '100%' }}>
            <Box textAlign="center" mb={2}>
                <Typography variant="h6">{t('TrashList.title')}</Typography>
            </Box>
            <Box textAlign="center" mb={2}>
                <Link href="/exclude/global" style={{ textDecoration: 'none' }}>
                    <Button
                        color="warning"
                        variant="outlined"
                        startIcon={<NotInterested />}
                    >
                        {t('TrashSchedule.button.globalExclude')}
                    </Button>
                </Link>
                <GlobalExcludeSummary globalExcludes={props.globalExcludes} />
            </Box>
            <Stack spacing={2} sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
                {props.trashes.map((trash, index) => (
                    <Box key={`trash-list-${index}`} sx={{ border: '1px solid #ddd', borderRadius: 2, p: 1.5 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                            <Typography variant="subtitle1">
                                {trashDisplayName(trash, t)}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Link href={`/trash?trashIndex=${index}`} style={{ textDecoration: 'none' }}>
                                    <Button size="small" variant="outlined" startIcon={<Edit />}>
                                        {t('TrashList.button.edit')}
                                    </Button>
                                </Link>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                    disabled={!canDelete}
                                    onClick={() => props.onDeleteTrash(index)}
                                >
                                    {t('TrashSchedule.button.delete')}
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                ))}
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Stack spacing={2} alignItems="center">
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Add />}
                    disabled={!canAdd}
                    onClick={props.onAddTrash}
                >
                    {t('ScheduleList.button.addtrash')}
                </Button>
                <Tooltip
                    title={t('App.checkbox.description')}
                    placement="top"
                    aria-label="description"
                >
                    <FormControlLabel
                        control={(
                            <Checkbox
                                checked={props.nextday_checked}
                                sx={{ color: green[600] }}
                                onChange={(event) => props.onChangeNextdayCheck(event.target.checked)}
                            />
                        )}
                        label={t('App.checkbox.nextday')}
                    />
                </Tooltip>
                <ErrorDialog showErrorDialog={props.showErrorDialog} onError={props.onError} />
                <Button
                    variant="contained"
                    color="primary"
                    disabled={props.submit_error || props.submitting}
                    onClick={props.onSubmit}
                >
                    {t('ScheduleList.button.regist')}
                </Button>
            </Stack>
        </Box>
    );
}
