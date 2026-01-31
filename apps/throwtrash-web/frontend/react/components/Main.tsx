import React from 'react';
import TrashSchedule from './TrashSchedule';
import { Button, Checkbox, FormControlLabel, Tooltip, Box, Stack } from '@mui/material';
import ErrorDialog from './ErrorDialog';
import { green } from '@mui/material/colors';
import { MainProps } from '../types/props';
import { submitTrashes } from '../lib/api-client';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { NotInterested } from '@mui/icons-material';
import GlobalExcludeSummary from './GlobalExcludeSummary';

const MAX_SCHEDULE = 10;

export default function Main(props: MainProps) {
    const { t } = useTranslation();

    const handleSubmit = async () => {
        try {
            props.onSubmit(true);
            const res = await submitTrashes({
                data: props.trashes,
                globalExcludes: props.globalExcludes,
                offset: new Date().getTimezoneOffset(),
                nextdayflag: props.nextday_checked ?? true
            });
            if (res) {
                (window as any).location = res;
            }
        } catch (error: any) {
            console.error("Regist error", error);
            props.onError(true);
            props.onSubmit(false);
        }
    };

    return (
        <Box sx={{ flexBasis: '90%', width: '100%' }}>
            <Box textAlign="center">
                <ul style={{ display: 'inline-block', textAlign: 'left' }}>
                    <li>{t('App.description.trash')}</li>
                    <li>{t('App.description.schedule')}</li>
                </ul>
            </Box>
            <Box textAlign="center" mt={2}>
                <Link href="/exclude/global" style={{ textDecoration: 'none' }}>
                    <Button
                        color='warning'
                        variant='outlined'
                        startIcon={<NotInterested />}>
                        {t('TrashSchedule.button.globalExclude')}
                    </Button>
                </Link>
                <GlobalExcludeSummary globalExcludes={props.globalExcludes} />
            </Box>
            <div data-title={t('IntroJS.main.title')} data-intro={t('IntroJS.main.hint')} data-step={1}>
                <TrashSchedule {...props} />
            </div>
            <Stack spacing={3} alignItems="center" mt={2}>
                <Button
                    variant="contained"
                    color="secondary"
                    disabled={props.trashes.length === MAX_SCHEDULE}
                    onClick={() => props.onClickAdd()}>
                    {t('ScheduleList.button.addtrash')}
                </Button>
                <Tooltip
                    title={t('App.checkbox.description')}
                    placement='top'
                    aria-label='description'>
                    <FormControlLabel
                        control={<Checkbox
                            checked={props.nextday_checked}
                            sx={{ color: green[600] }}
                            onChange={(event) => props.onChangeNextdayCheck(event.target.checked)} />
                        }
                        label={t('App.checkbox.nextday')} />
                </Tooltip>
                <ErrorDialog {...props} />
                <Button
                    variant="contained"
                    color="primary"
                    disabled={props.submit_error || props.submitting}
                    onClick={handleSubmit}>
                    {t('ScheduleList.button.regist')}
                </Button>
            </Stack>
        </Box>
    );
}
