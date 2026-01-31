import React from 'react';
import { Button, Box, Stack } from '@mui/material';
import TrashType from './TrashType';
import Schedules from './Schedules';
import Link from 'next/link';
import { Delete, NotInterested, CalendarToday } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { MainProps } from '../types/props';

type Props = MainProps;

export default function TrashSchedule(props: Props) {
    const { t } = useTranslation();
    const { trashes, addSchedule, onClickDelete, onChangeTrash, onInputTrashType, onChangeSchedule, onChangeInput, deleteSchedule } = props;

    return (
        <Stack spacing={1.5}>
            {trashes.map((trash, i) => (
                <Box key={`trash-${i}`} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: '85%', md: '75%' } }}>
                        <Box>
                            <TrashType
                                number={i}
                                trash={trash as any}
                                onChangeTrash={onChangeTrash}
                                onInputTrashType={onInputTrashType}
                            />
                            <Schedules
                                trash={trash as any}
                                trash_index={i}
                                onChangeSchedule={onChangeSchedule}
                                onChangeInput={onChangeInput}
                                deleteSchedule={deleteSchedule}
                            />
                        </Box>
                        <Box sx={{ textAlign: 'center', '& button': { m: 0.5 }, mt: 1 }}>
                            {trash.schedules.length < 3 && (
                                <Button
                                    color='primary'
                                    variant='outlined'
                                    startIcon={<CalendarToday />}
                                    onClick={() => addSchedule(i)}
                                >
                                    {t('TrashSchedule.button.add')}
                                </Button>
                            )}
                            <Link href={`/exclude/?trashIndex=${i}`} style={{ textDecoration: 'none' }}>
                                <Button
                                    color='warning'
                                    variant='outlined'
                                    startIcon={<NotInterested />}>
                                    {t('TrashSchedule.button.exclude')}
                                </Button>
                            </Link>
                            <Button
                                variant='outlined'
                                color='error'
                                startIcon={<Delete />}
                                onClick={() => onClickDelete(i)}
                            >
                                {t('TrashSchedule.button.delete')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            ))}
        </Stack>
    );
}
