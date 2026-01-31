export type EvweekValue = {
    weekday: string;
    interval?: number;
    start: string;
};
export type TrashTypeValue = {
    type: string;
    name: string;
};
export type ScheduleValue = {
    type: string;
    value: string | EvweekValue;
};
export type TrashData = {
    type: string;
    trash_val?: string;
    schedules: Array<ScheduleValue>;
    excludes?: Array<ExcludeDate>;
};
export type TrashSchedule = {
    trashData: TrashData[];
    checkedNextday: boolean;
};
export type ExcludeDate = {
    month: number;
    date: number;
};
