// 郵便番号検索状態。ZipcodeReducerと等価の挙動を維持する。
import cloneDeep from 'lodash/cloneDeep';
import { ZipcodeState, ZipcodeStatusEnum, Trash } from './types';

export const ZipcodeStatus = ZipcodeStatusEnum;

export const init_address_page_state = () => ({
    per_page: 5,
    current_page: 0,
    address_list: [] as string[]
});

export const init_trash_page_state = () => ({
    per_page: 5,
    current_page: 0,
    trash_list: [] as Trash[][],
    trash_text_list: [] as string[]
});

export const initialState: ZipcodeState = {
    zipcode: '',
    submitting: false,
    status: ZipcodeStatus.None,
    address_page_state: init_address_page_state(),
    trash_page_state: init_trash_page_state(),
    error: undefined,
    message: undefined
};

export enum Action {
    setMessage = 'setMessage',
    changeZipcode = 'changeZipcode',
    submitZipcode = 'submitZipcode',
    changeStatus = 'changeStatus',
    setError = 'setError',
    changePage = 'changePage',
    changePerPage = 'changePerPage'
}

const WEEKDAY_NAME: Record<string, string> = {
    0: '日曜日',
    1: '月曜日',
    2: '火曜日',
    3: '水曜日',
    4: '木曜日',
    5: '金曜日',
    6: '土曜日'
};

const toScheduleText = (schedule_type: string, schedule_value: any) => {
    if (schedule_type === 'weekday') {
        return `毎週${WEEKDAY_NAME[schedule_value]}`;
    } else if (schedule_type === 'month') {
        return `毎月${schedule_value}日`;
    } else if (schedule_type === 'biweek') {
        const num_of_week = String(schedule_value).split('-');
        return `第${num_of_week[1]}${WEEKDAY_NAME[num_of_week[0]]}`;
    } else if (schedule_type === 'evweek') {
        return `${schedule_value.interval}週に1度の${WEEKDAY_NAME[schedule_value.weekday]}`;
    }
    return '';
};

const TRASH_NAME: Record<string, string> = {
    burn: 'もえるゴミ',
    unburn: 'もえないゴミ',
    bin: 'ビン',
    can: 'カン',
    petbottle: 'ペットボトル',
    plastic: 'プラスチック',
    paper: '古紙',
    resource: '資源ゴミ',
    coarse: '粗大ゴミ'
};

const toTrashName = (trash_type: string, trash_val: string) => {
    if (trash_type === 'other') return trash_val;
    return TRASH_NAME[trash_type];
};

type ActionType =
  | { type: Action.setMessage; message: string }
  | { type: Action.changeZipcode; zipcode: string }
  | { type: Action.submitZipcode; status: boolean }
  | { type: Action.changeStatus; status: ZipcodeStatusEnum; value: string[] | Trash[][] }
  | { type: Action.setError }
  | { type: Action.changePage; page: number }
  | { type: Action.changePerPage; per_page: number };

export const reducer = (state: ZipcodeState = initialState, action: ActionType): ZipcodeState => {
    const new_state: ZipcodeState = { ...state };
    switch (action.type) {
    case Action.setMessage:
        new_state.message = action.message;
        break;
    case Action.changeZipcode:
        new_state.zipcode = action.zipcode;
        break;
    case Action.submitZipcode:
        new_state.submitting = action.status;
        break;
    case Action.changeStatus:
        new_state.status = action.status;
        if (action.status === ZipcodeStatus.AddressSelect) {
            new_state.address_page_state.address_list = cloneDeep(action.value as string[]);
        } else if (action.status === ZipcodeStatus.ResultSelect) {
            new_state.trash_page_state.trash_list = cloneDeep(action.value as Trash[][]);
            new_state.trash_page_state.trash_text_list = (action.value as Trash[][]).map((trashes) => {
                const trash_text_list: string[] = [];
                trashes.forEach((trash: Trash) => {
                    const schedule_text_list: string[] = [];
                    trash.schedules.forEach((schedule) => {
                        schedule_text_list.push(toScheduleText(schedule.type, schedule.value));
                    });
                    trash_text_list.push(`${toTrashName(trash.type, trash.trash_val)}: ${schedule_text_list.join(',')}`);
                });
                return trash_text_list.join('/');
            });
        } else {
            new_state.address_page_state = init_address_page_state();
            new_state.trash_page_state = init_trash_page_state();
        }
        new_state.error = undefined;
        break;
    case Action.setError:
        new_state.error = '一致するユーザーの情報が見つかりませんでした。';
        break;
    case Action.changePage:
        if (state.status === ZipcodeStatus.AddressSelect) {
            new_state.address_page_state.current_page = action.page;
        } else if (state.status === ZipcodeStatus.ResultSelect) {
            new_state.trash_page_state.current_page = action.page;
        }
        break;
    case Action.changePerPage:
        if (state.status === ZipcodeStatus.AddressSelect) {
            new_state.address_page_state.per_page = action.per_page;
        } else if (state.status === ZipcodeStatus.ResultSelect) {
            new_state.trash_page_state.per_page = action.per_page;
        }
        break;
    default:
        return state;
    }
    return new_state;
};
