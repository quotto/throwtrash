import React from 'react';
import { Button, FormControl, FormLabel, FormGroup, IconButton, Box } from '@mui/material';
import { CalendarToday, RadioButtonChecked, RadioButtonUnchecked, HighlightOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import WeekDay from './schedule-inputs/WeekDay';
import EvWeek from './schedule-inputs/EvWeek';
import BiWeek from './schedule-inputs/BiWeek';
import Month from './schedule-inputs/Month';
import { MainProps } from '../types/props';

type Props = {
    trash: any;
    trash_index: number;
    onChangeSchedule: MainProps['onChangeSchedule'];
    onChangeInput: MainProps['onChangeInput'];
    deleteSchedule: MainProps['deleteSchedule'];
};

interface ScheduleTypeButtonProps extends Props {
    schedule_index: number;
    selected_trash_type: string;
    schedule_type: string;
}

function ScheduleOption(props: ScheduleTypeButtonProps) {
    const { trash, schedule_index, schedule_type } = props;
    const target_schedule = trash.schedules[schedule_index];
    switch (schedule_type) {
    case 'weekday':
        return <WeekDay target_schedule={target_schedule} {...props} />;
    case 'biweek':
        return <BiWeek target_schedule={target_schedule} {...props} />;
    case 'month':
        return <Month target_schedule={target_schedule} {...props} />;
    case 'evweek':
        return <EvWeek target_schedule={target_schedule} {...props} />;
    default:
        return <div />;
    }
}

function ScheduleTypeButton(props: ScheduleTypeButtonProps) {
    const { t } = useTranslation();
    const { schedule_index, trash_index, selected_trash_type, schedule_type, onChangeSchedule } = props;
    const selected = selected_trash_type === schedule_type;
    return (
        <Button
            id={`${schedule_type}-${trash_index}-${schedule_index}`}
            sx={{ m: 0.5 }}
            variant='contained'
            size='small'
            startIcon={selected ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
            color={selected ? 'primary' : undefined}
            onClick={() => onChangeSchedule(trash_index, schedule_index, schedule_type)}
        >
            {t(`TrashSchedule.select.scheduletype.option.${schedule_type}`)}
        </Button>
    );
}

export default function Schedules(props: Props) {
    const { t } = useTranslation();
    const { trash, trash_index, deleteSchedule, ...rest } = props;

    return (
        <Box>
            {trash.schedules.map((_: any, i: number) => (
                <Box
                    key={`Grid${i}`}
                    sx={{
                        mb: 2.5,
                        backgroundColor: i % 2 === 1 ? 'white' : '#f5f5f5',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Box>
                            <FormControl>
                                <FormLabel sx={{ transform: 'scale(0.75)', transformOrigin: 'top left' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#1976d2' }}>
                                        <CalendarToday color='primary' sx={{ ml: 1, width: 20 }} />
                                        <span>{t('TrashSchedule.select.scheduletype.label') + (i + 1)}</span>
                                    </div>
                                </FormLabel>
                                <FormGroup row>
                                    {['weekday', 'month', 'biweek', 'evweek'].map((type) => (
                                        <ScheduleTypeButton
                                            key={type}
                                            schedule_index={i}
                                            selected_trash_type={trash.schedules[i].type}
                                            schedule_type={type}
                                            trash={trash}
                                            trash_index={trash_index}
                                            deleteSchedule={deleteSchedule}
                                            {...rest}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        </Box>
                        <Box sx={{ pt: 1 }}>
                            <ScheduleOption
                                schedule_index={i}
                                selected_trash_type={trash.schedules[i].type}
                                schedule_type={trash.schedules[i].type}
                                trash={trash}
                                trash_index={trash_index}
                                deleteSchedule={deleteSchedule}
                                {...rest}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ width: 60, textAlign: 'center' }}>
                        <IconButton color='error' onClick={() => deleteSchedule(trash_index, i)}>
                            <HighlightOff />
                        </IconButton>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
