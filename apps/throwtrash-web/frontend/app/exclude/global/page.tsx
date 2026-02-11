"use client";

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
    Select,
    MenuItem,
    IconButton,
    Button,
    Alert,
    FormControl,
    InputLabel,
    Box,
    Stack
} from '@mui/material';
import { AddCircle, HighlightOff } from '@mui/icons-material';
import { grey } from '@mui/material/colors';
import { useExcludeDate, useTrashForm } from '../../providers/StoreProvider';
import { Action as ExcludeAction, initialExcludeDate } from '../../states/exclude-date';
import { Action as TrashAction } from '../../states/trash-form';
import { useTranslation } from 'react-i18next';
import TopAppBarAdapter from '../../adapters/TopAppBarAdapter';
import '../../../react/lang/i18n';

export const dynamic = 'force-static';

export function GlobalExcludePageInner() {
    const router = useRouter();
    const { t } = useTranslation();
    const { state: excludeState, dispatch: dispatchExclude } = useExcludeDate();
    const { state: trashState, dispatch: dispatchTrash } = useTrashForm();

    React.useEffect(() => {
        dispatchExclude({
            type: ExcludeAction.init,
            index: -1,
            excludes: trashState.globalExcludes.length > 0 ? trashState.globalExcludes : [initialExcludeDate]
        });
    }, [trashState.globalExcludes, dispatchExclude]);

    const isSubmitted = trashState.is_global_excludes_submitted;
    const isError = trashState.is_global_excludes_error;

    const monthDays = (month: number) => {
        if (month === 2) return 29;
        return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
    };

    const handleSubmit = () => {
        dispatchTrash({
            type: TrashAction.submitGlobalExclude,
            excludes: excludeState.excludes
        });
        router.push('/');
    };

    const handleBack = () => {
        dispatchTrash({ type: TrashAction.resetGlobalExcludeSubmit });
        router.push('/');
    };

    return (
        <main style={{ padding: '16px' }}>
            <Stack spacing={2} alignItems="center">
                <Box textAlign="center" sx={{ fontSize: '1.5em' }}>
                    {t('ExcludePage.global.title')}
                </Box>
                {excludeState.excludes.map((ex, idx) => {
                    const maxDate = monthDays(ex.month);
                    return (
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="center"
                            key={`global-ex-${idx}`}
                            data-testid="global-exclude-row"
                            sx={{ width: '100%', flexWrap: 'wrap' }}
                        >
                            <FormControl>
                                <InputLabel id={`global-month-${idx}`}>月</InputLabel>
                                <Select
                                    labelId={`global-month-${idx}`}
                                    value={ex.month}
                                    label="月"
                                    onChange={(e) =>
                                        dispatchExclude({
                                            type: ExcludeAction.change,
                                            index: idx,
                                            month: e.target.value as number,
                                            date: ex.date
                                        })
                                    }
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                        <MenuItem value={m} key={`gm-${m}`}>
                                            {m}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div>月</div>
                            <FormControl>
                                <InputLabel id={`global-date-${idx}`}>日</InputLabel>
                                <Select
                                    labelId={`global-date-${idx}`}
                                    value={ex.date}
                                    label="日"
                                    onChange={(e) =>
                                        dispatchExclude({
                                            type: ExcludeAction.change,
                                            index: idx,
                                            month: ex.month,
                                            date: e.target.value as number
                                        })
                                    }
                                >
                                    {Array.from({ length: maxDate }, (_, i) => i + 1).map((d) => (
                                        <MenuItem value={d} key={`gd-${d}`}>
                                            {d}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div>日</div>
                            <IconButton
                                color="error"
                                aria-label="global-exclude-delete"
                                onClick={() => dispatchExclude({ type: ExcludeAction.del, index: idx })}
                            >
                                <HighlightOff />
                            </IconButton>
                        </Stack>
                    );
                })}
                {excludeState.excludes.length < 10 && (
                    <Box textAlign="center">
                        <IconButton
                            color="secondary"
                            aria-label="global-exclude-add"
                            onClick={() => dispatchExclude({ type: ExcludeAction.add })}
                        >
                            <AddCircle />
                        </IconButton>
                    </Box>
                )}
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                        variant="contained"
                        color="primary"
                        aria-label="global-exclude-submit"
                        onClick={handleSubmit}
                    >
                        設定する
                    </Button>
                    <Button
                        variant="contained"
                        style={{ backgroundColor: grey[500], color: '#fff' }}
                        onClick={handleBack}
                    >
                        戻る
                    </Button>
                </Stack>
                {isError && (
                    <Alert severity="error">エラーが発生したため設定できません。</Alert>
                )}
                {isSubmitted && (
                    <Alert severity="success">設定しました。</Alert>
                )}
            </Stack>
        </main>
    );
}

export default function GlobalExcludePage() {
    return (
        <>
            <TopAppBarAdapter />
            <Suspense fallback={<main>Loading...</main>}>
                <GlobalExcludePageInner />
            </Suspense>
        </>
    );
}
