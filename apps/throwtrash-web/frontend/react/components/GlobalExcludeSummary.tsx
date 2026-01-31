import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { ExcludeDate } from '../../app/states/types';

type Props = {
    globalExcludes: ExcludeDate[];
};

export default function GlobalExcludeSummary({ globalExcludes }: Props) {
    const { t } = useTranslation();

    if (globalExcludes.length === 0) {
        return (
            <Box textAlign="center" mt={1}>
                <Typography variant="body2">{t('TrashSchedule.globalExcludes.empty')}</Typography>
            </Box>
        );
    }

    return (
        <Box textAlign="center" mt={1}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
                {t('TrashSchedule.globalExcludes.label')}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                {globalExcludes.map((exclude) => (
                    <Chip
                        key={`${exclude.month}-${exclude.date}`}
                        size="small"
                        label={t('TrashSchedule.globalExcludes.item', {
                            month: exclude.month,
                            date: exclude.date
                        })}
                    />
                ))}
            </Stack>
        </Box>
    );
}
