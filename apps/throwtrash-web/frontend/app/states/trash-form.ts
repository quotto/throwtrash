// Trashフォーム用のReducer。現行TrashReducerと同等の挙動を維持する。
import cloneDeep from 'lodash/cloneDeep';
import {
    exist_error,
    schedule_exist,
    input_month_check,
    validate_excludes,
    input_trash_type_check,
    validate_excludes_with_limit
} from './validators';
import {
    Trash,
    Schedule,
    ScheduleValue,
    TrashFormState,
    TrashFormAction
} from './types';

const todayIso = () => new Date().toISOString().split('T')[0];

const initialScheduleValue = (type: Schedule['type']): ScheduleValue => {
    switch (type) {
    case 'weekday':
        return '0';
    case 'biweek':
        return '0-1';
    case 'month':
        return '';
    case 'evweek':
    default:
        // 隔週（every week interval）開始日は現在日付で初期化
        return { weekday: '0', start: todayIso(), interval: 2 };
    }
};

const initialSchedule = (): Schedule => ({
    type: 'weekday',
    value: initialScheduleValue('weekday'),
    error: undefined
});

const createInitialTrash = (): Trash => ({
    type: 'burn',
    trash_val: '',
    schedules: [initialSchedule()],
    excludes: [],
    trash_type_error: undefined,
    input_trash_type_error: undefined,
    is_excludes_submitted: false,
    is_excludes_error: false
});

const initialState: TrashFormState = {
    trashes: [createInitialTrash()],
    error: false,
    globalExcludes: [],
    is_global_excludes_submitted: false,
    is_global_excludes_error: false
};

export enum Action {
    addTrash = 'addTrash',
    changeTrashKind = 'changeTrashKind',
    changeScheduleType = 'changeScheduleType',
    changeScheduleValue = 'changeScheduleValue',
    addSchedule = 'addSchedule',
    deleteSchedule = 'deleteSchedule',
    deleteTrash = 'deleteTrash',
    syncPreset = 'syncPreset',
    inputTrashType = 'inputTrashType',
    resetExcludeSubmit = 'resetExcludeSubmit',
    submitExclude = 'submitExclude',
    resetGlobalExcludeSubmit = 'resetGlobalExcludeSubmit',
    submitGlobalExclude = 'submitGlobalExclude'
}

export const reducer = (state: TrashFormState = initialState, action: TrashFormAction): TrashFormState => {
    const new_state = cloneDeep(state);
    switch (action.type) {
    case Action.addTrash: {
        new_state.trashes.push(createInitialTrash());
        new_state.error = exist_error(new_state.trashes);
        return new_state;
    }
    case Action.changeTrashKind: {
        Object.assign(new_state.trashes[action.index], { type: action.kind, trash_val: '', input_trash_type_error: undefined });
        new_state.error = exist_error(new_state.trashes);
        return new_state;
    }
    case Action.changeScheduleType: {
        const i = action.trashIndex;
        const j = action.scheduleIndex;
        new_state.trashes[i].schedules[j] = {
            type: action.scheduleType,
            value: initialScheduleValue(action.scheduleType),
            error: undefined
        };
        new_state.trashes[i].trash_type_error = schedule_exist(new_state.trashes[i].schedules);
        new_state.error = exist_error(new_state.trashes);
        return new_state;
    }
    case Action.changeScheduleValue: {
        const i = action.trashIndex;
        const j = action.scheduleIndex;
        let error = undefined;
        if (new_state.trashes[i].schedules[j].type === 'month') {
            error = input_month_check(action.value as string);
        }
        Object.assign(new_state.trashes[i].schedules[j], { value: action.value, error });
        new_state.error = exist_error(new_state.trashes);
        return new_state;
    }
    case Action.addSchedule: {
        const target = new_state.trashes[action.trashIndex];
        if (target.schedules.length < 3) {
            target.schedules.push(initialSchedule());
        }
        return new_state;
    }
    case Action.deleteSchedule: {
        const target = new_state.trashes[action.trashIndex];
        if (target.schedules.length > 1) {
            target.schedules.splice(action.scheduleIndex, 1);
        }
        return new_state;
    }
    case Action.inputTrashType: {
        Object.assign(new_state.trashes[action.index], { trash_val: action.value });
        Object.assign(
            new_state.trashes[action.index],
            { input_trash_type_error: input_trash_type_check(new_state.trashes[action.index], action.maxlength) }
        );
        new_state.error = exist_error(new_state.trashes);
        return new_state;
    }
    case Action.deleteTrash: {
        new_state.trashes.splice(action.index, 1);
        new_state.error = exist_error(new_state.trashes);
        return new_state;
    }
    case Action.syncPreset: {
        if (action.preset && action.preset.length > 0) {
            new_state.trashes = cloneDeep(action.preset).map((trash) => {
                if (!trash.excludes) trash.excludes = [];
                return trash;
            });
            new_state.error = exist_error(new_state.trashes);
        }
        if (action.globalExcludes !== undefined) {
            new_state.globalExcludes = cloneDeep(action.globalExcludes);
        }
        return new_state;
    }
    case Action.resetExcludeSubmit: {
        new_state.trashes[action.index].is_excludes_error = false;
        new_state.trashes[action.index].is_excludes_submitted = false;
        return new_state;
    }
    case Action.submitExclude: {
        const ok = validate_excludes(action.excludes);
        if (ok) {
            new_state.trashes[action.index].excludes = action.excludes;
        }
        new_state.trashes[action.index].is_excludes_error = !ok;
        new_state.trashes[action.index].is_excludes_submitted = ok;
        return new_state;
    }
    case Action.resetGlobalExcludeSubmit: {
        new_state.is_global_excludes_error = false;
        new_state.is_global_excludes_submitted = false;
        return new_state;
    }
    case Action.submitGlobalExclude: {
        const ok = validate_excludes_with_limit(action.excludes, 10);
        if (ok) {
            new_state.globalExcludes = action.excludes;
        }
        new_state.is_global_excludes_error = !ok;
        new_state.is_global_excludes_submitted = ok;
        return new_state;
    }
    default:
        return state;
    }
};
export {
    initialState,
    createInitialTrash,
    initialSchedule,
    initialScheduleValue
};
