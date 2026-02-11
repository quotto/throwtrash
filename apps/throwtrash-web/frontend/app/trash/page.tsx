"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CalendarToday, Delete, NotInterested, Save } from '@mui/icons-material';
import { useTrashForm } from '../providers/StoreProvider';
import { Action as TrashAction } from '../states/trash-form';
import TrashType from '../../react/components/TrashType';
import Schedules from '../../react/components/Schedules';
import TopAppBarAdapter from '../adapters/TopAppBarAdapter';
import { useTranslation } from 'react-i18next';
import '../../react/lang/i18n';

export function TrashEditPageInner({ trashIndex }: { trashIndex: number }) {
    const router = useRouter();
    const { t } = useTranslation();
    const { state: trashState, dispatch: dispatchTrash } = useTrashForm();

    const targetTrash = trashState.trashes[trashIndex];
    if (!targetTrash) {
        return (
            <main style={{ padding: '16px' }}>
                <Stack spacing={2} alignItems="center">
                    <Typography>指定のゴミ種別が見つかりません。</Typography>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <Button variant="contained">{t('TrashList.button.back')}</Button>
                    </Link>
                </Stack>
            </main>
        );
    }

    const canDelete = trashState.trashes.length > 1;

    const handleSave = () => {
        router.push('/');
    };

    const handleDelete = () => {
        dispatchTrash({ type: TrashAction.deleteTrash, index: trashIndex });
        router.push('/');
    };

    return (
        <main style={{ padding: '16px' }}>
            <Stack spacing={2} alignItems="center">
                <Typography variant="h6">{t('TrashEdit.title')}</Typography>
                <Box sx={{ width: { xs: '100%', sm: '85%', md: '75%' } }}>
                    <TrashType
                        number={trashIndex}
                        trash={targetTrash as any}
                        onChangeTrash={(i, value) => dispatchTrash({ type: TrashAction.changeTrashKind, index: i, kind: value })}
                        onInputTrashType={(i, value, maxlength) => dispatchTrash({ type: TrashAction.inputTrashType, index: i, value, maxlength })}
                    />
                    <Schedules
                        trash={targetTrash as any}
                        trash_index={trashIndex}
                        onChangeSchedule={(i, j, value) => dispatchTrash({ type: TrashAction.changeScheduleType, trashIndex: i, scheduleIndex: j, scheduleType: value })}
                        onChangeInput={(i, j, value) => dispatchTrash({ type: TrashAction.changeScheduleValue, trashIndex: i, scheduleIndex: j, value })}
                        deleteSchedule={(ti, si) => dispatchTrash({ type: TrashAction.deleteSchedule, trashIndex: ti, scheduleIndex: si })}
                    />
                    <Box sx={{ textAlign: 'center', '& button': { m: 0.5 } }}>
                        {targetTrash.schedules.length < 3 && (
                            <Button
                                color="primary"
                                variant="outlined"
                                startIcon={<CalendarToday />}
                                onClick={() => dispatchTrash({ type: TrashAction.addSchedule, trashIndex })}
                            >
                                {t('TrashSchedule.button.add')}
                            </Button>
                        )}
                        <Link href={`/exclude/?trashIndex=${trashIndex}`} style={{ textDecoration: 'none' }}>
                            <Button
                                color="warning"
                                variant="outlined"
                                startIcon={<NotInterested />}
                            >
                                {t('TrashSchedule.button.exclude')}
                            </Button>
                        </Link>
                    </Box>
                </Box>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
                        aria-label="trash-edit-save"
                        onClick={handleSave}
                    >
                        {t('TrashEdit.button.save')}
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        aria-label="trash-edit-delete"
                        disabled={!canDelete}
                        onClick={handleDelete}
                    >
                        {t('TrashSchedule.button.delete')}
                    </Button>
                </Stack>
            </Stack>
        </main>
    );
}

function TrashEditPageContent() {
    const params = useSearchParams();
    const trashIndex = Number(params.get('trashIndex') ?? -1);

    return <TrashEditPageInner trashIndex={trashIndex} />;
}

export default function TrashEditPage() {
    return (
        <>
            <TopAppBarAdapter />
            <Suspense fallback={<main>Loading...</main>}>
                <TrashEditPageContent />
            </Suspense>
        </>
    );
}
