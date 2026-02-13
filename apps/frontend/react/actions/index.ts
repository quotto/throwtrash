import { Trash } from "../reducers/TrashReducer";

export enum ACTION_TYPE {
    ADD_TRASH,
    CHANGE_TRASH,
    CHANGE_SCHEDULE,
    ADD_SCHEDULE,
    DEL_SCHEDULE,
    CHANGE_INPUT,
    INPUT_TRASH_TYPE,
    DEL_TRASH,
    ERROR_DIALOG,
    SET_SUBMITTING,
    SET_USER_INFO,
    SIGN_OUT,
    SIGNIN_DIALOG,
    MENU_CHANGE,
    NOTIFICATION_DIALOG,
    ADD_EXCLUDE,
    DEL_EXCLUDE,
    SUBMIT_EXCLUDE,
    CHANGE_EXCLUDE,
    INIT_EXCLUDE,
    RESET_EXCLUDE_SUBMIT,
    CHANGE_ZIPCODE,
    SET_ZIPCODE_MESSAGE,
    SUBMIT_ZIPCODE,
    CHANGE_ZIPCODE_STATUS,
    ERROR_ZIPCODE,
    SET_PRESET,
    CHANGE_PAGE,
    CHANGE_PER_PAGE,
    CHECK_NEXTDAY
}

interface AddTrashAction {
    type: ACTION_TYPE.ADD_TRASH
}

export const addTrash = (): AddTrashAction => {
    return {
        type: ACTION_TYPE.ADD_TRASH
    };
};

interface ChangeScheduleAction  {
    type: ACTION_TYPE.CHANGE_SCHEDULE,
    index: number[],
    value: string
}
export const changeSchedule = (i:number,j:number,value: string): ChangeScheduleAction => {
    return {
        type: ACTION_TYPE.CHANGE_SCHEDULE,
        index: [i,j],
        value: value
    };
};

interface AddScheduleAction {
    type: ACTION_TYPE.ADD_SCHEDULE,
    trash_index: number
}
export const addSchedule = (trash_index: number): AddScheduleAction => {
    return {
        type: ACTION_TYPE.ADD_SCHEDULE,
        trash_index: trash_index
    };
};

interface DeleteScheduleAction {
    type: ACTION_TYPE.DEL_SCHEDULE,
    trash_index: number,
    schedule_index: number
}
export const deleteSchedule = (trash_index: number, schedule_index: number): DeleteScheduleAction => {
    return {
        type: ACTION_TYPE.DEL_SCHEDULE,
        trash_index,
        schedule_index
    };
};

interface CahngeTrashTypeAction {
    type: ACTION_TYPE.CHANGE_TRASH
    index: number,
    value: string,
    validate: Function[]
}
export const changeTrashType = (i: number,value: string,validate: Function[]): CahngeTrashTypeAction => {
    console.log(value);
    return {
        type: ACTION_TYPE.CHANGE_TRASH,
        index: i,
        value: value,
        validate: validate
    };
};

interface EvWeek {weekday: string, start: string, interval: number}
interface ChangeInputAction{
    type: ACTION_TYPE.CHANGE_INPUT,
    index: number[],
    value: string | EvWeek
}
export const changeInput = (i: number,j: number,value: string | EvWeek): ChangeInputAction => {
    return {
        type: ACTION_TYPE.CHANGE_INPUT,
        index: [i,j],
        value: value
    };
};

interface InputTrashTypeAction {
    type: ACTION_TYPE.INPUT_TRASH_TYPE,
    index: number,
    value: string,
    maxlength: number
}
export const inputTrashType = (i: number,value: string,maxlength: number): InputTrashTypeAction => {
    return {
        type: ACTION_TYPE.INPUT_TRASH_TYPE,
        index: i,
        value: value,
        maxlength: maxlength
    };
};

interface DeleteTrashAction {
    type: ACTION_TYPE.DEL_TRASH,
    index: number
}
export const deleteTrash = (i: number): DeleteTrashAction => {
    return {
        type: ACTION_TYPE.DEL_TRASH,
        index: i
    };
};

interface SetSubmittingAction {
    type: ACTION_TYPE.SET_SUBMITTING,
    value: boolean
}
export const setSubmitting = (status: boolean): SetSubmittingAction=> {
    return {
        type: ACTION_TYPE.SET_SUBMITTING,
        value: status
    };
};

interface SetUserInfoAction {
    type: ACTION_TYPE.SET_USER_INFO,
    user_info: {name: string},
    preset: Trash[]
}
export const setUserInfo = (user_info: {name: string}, preset: Trash[]): SetUserInfoAction=>{
    return {
        type: ACTION_TYPE.SET_USER_INFO,
        user_info: user_info,
        preset: preset
    };
};

interface SignOutAction {
    type: ACTION_TYPE.SIGN_OUT
}
export const signOut = (): SignOutAction=>{
    return {
        type: ACTION_TYPE.SIGN_OUT
    };
};

interface ErrorDialogAction {
    type: ACTION_TYPE.ERROR_DIALOG,
    openDialog?: boolean
}
export const errorDialog = (open: boolean): ErrorDialogAction=>{
    return {
        type: ACTION_TYPE.ERROR_DIALOG,
        openDialog: open
    };
};

interface SigninDialogAction {
    type: ACTION_TYPE.SIGNIN_DIALOG,
    open: boolean
}
export const signinDialog =(value: boolean): SigninDialogAction=>{
    return {
        type: ACTION_TYPE.SIGNIN_DIALOG,
        open: value
    };
};

interface ChangeMenuAction {
    type: ACTION_TYPE.MENU_CHANGE,
    open: boolean,
    anchorEl: Element | null
}
export const changeMenu = (value: boolean,target: Element | null): ChangeMenuAction=>{
    return {
        type: ACTION_TYPE.MENU_CHANGE,
        open: value,
        anchorEl: target
    };
};

interface NotificationDialogAction {
    type: ACTION_TYPE.NOTIFICATION_DIALOG,
    open?: boolean
}
export const notificationDialog= (value: boolean): NotificationDialogAction=> {
    return {
        type: ACTION_TYPE.NOTIFICATION_DIALOG, open: value
    };
};

interface AddExcludeDateAction {
    type: ACTION_TYPE.ADD_EXCLUDE
}
export const addExcludeDate = (): AddExcludeDateAction=> {
    return {
        type: ACTION_TYPE.ADD_EXCLUDE
    }
};

interface DeleteExcludeDateAction {
    type: ACTION_TYPE.DEL_EXCLUDE,
    index: number
}
export const deleteExcludeDate = (index: number): DeleteExcludeDateAction=> {
    return {
        type: ACTION_TYPE.DEL_EXCLUDE,
        index: index
    };
};

interface Exclude {
    month: number,
    date: number
}
interface SubmitExcludeDateAction {
    type: ACTION_TYPE.SUBMIT_EXCLUDE,
    index: number,
    excludes: Exclude[]
}
export const submitExcludeDate = (index: number, excludes: Exclude[]): SubmitExcludeDateAction=> {
    return {
        type: ACTION_TYPE.SUBMIT_EXCLUDE,
        index: index,
        excludes: excludes
    };
};

interface ChangeExcludeDateAction {
    type: ACTION_TYPE.CHANGE_EXCLUDE,
    index: number,
    month: number,
    date: number
}
export const changeExcludeDate = (index: number, month: number, date: number): ChangeExcludeDateAction=>{
    return {
        type: ACTION_TYPE.CHANGE_EXCLUDE,
        index: index,
        month: month,
        date: date
    };
};

interface InitExcludeDateAction {
    type: ACTION_TYPE.INIT_EXCLUDE,
    index: number,
    excludes: Exclude[]
}
export const initExcludeDate = (index: number, excludes: Exclude[]): InitExcludeDateAction => {
    return {
        type: ACTION_TYPE.INIT_EXCLUDE,
        index: index,
        excludes: excludes
    };
};

interface ResetExcludeSubmitAction {
    type: ACTION_TYPE.RESET_EXCLUDE_SUBMIT,
    index: number
}
export const resetExcludeSubmit = (index: number): ResetExcludeSubmitAction => {
    return {
        type: ACTION_TYPE.RESET_EXCLUDE_SUBMIT,
        index: index
    };
};

interface SetZipcodeMessageAction {
    type: ACTION_TYPE.SET_ZIPCODE_MESSAGE,
    message: string
}
export const setZipcodeMessage = (message: string): SetZipcodeMessageAction => {
    return {
        type: ACTION_TYPE.SET_ZIPCODE_MESSAGE,
        message: message
    };
};

interface ChangeZipcodeAction {
    type: ACTION_TYPE.CHANGE_ZIPCODE,
    zipcode: string
}
export const changeZipcode = (value: string): ChangeZipcodeAction => (
    {
        type: ACTION_TYPE.CHANGE_ZIPCODE,
        zipcode: value
    }
);

interface SubmitZipcodeAction {
    type: ACTION_TYPE.SUBMIT_ZIPCODE,
    status: boolean
}
export const submitZipcode = (submit: boolean): SubmitZipcodeAction => (
    {
        type: ACTION_TYPE.SUBMIT_ZIPCODE,
        status: submit //true: サブミット中, false: 検索可能
    }
);

interface ChangeZipcodeStatusAction {
    type: ACTION_TYPE.CHANGE_ZIPCODE_STATUS,
    status: number,
    value: string[] | Trash[][]
}
export const changeZipcodeStatus = (status: number, value: string[] | Trash[][]): ChangeZipcodeStatusAction => (
    {
        type: ACTION_TYPE.CHANGE_ZIPCODE_STATUS,
        status: status,
        value: value // アドレス一覧選択の場合は住所リスト,ゴミ出し予定選択の場合はゴミ出し予定のリスト,通常状態なら値無し(空のリスト)
    }
);

interface SetErrorZipcodeAction {
    type: ACTION_TYPE.ERROR_ZIPCODE
}
export const setErrorZipcode = (): SetErrorZipcodeAction => (
    {
        type: ACTION_TYPE.ERROR_ZIPCODE
    }
);

interface SetPresetAction {
    type: ACTION_TYPE.SET_PRESET,
    preset: Trash[]
}
export const setPreset = (preset: Trash[]): SetPresetAction => (
    {
        type: ACTION_TYPE.SET_PRESET,
        preset: preset
    }
);

interface ChangePageAction {
    type: ACTION_TYPE.CHANGE_PAGE,
    page: number
}
export const changePage = (page: number): ChangePageAction => (
    {
        type: ACTION_TYPE.CHANGE_PAGE,
        page: page
    }
);

interface ChangePerPageAction {
    type: ACTION_TYPE.CHANGE_PER_PAGE,
    per_page: number
}
export const changePerPage = (per_page: number): ChangePerPageAction => (
    {
        type: ACTION_TYPE.CHANGE_PER_PAGE,
        per_page: per_page
    }
);
interface ChangeNextdayCheckAction {
    type: ACTION_TYPE.CHECK_NEXTDAY,
    value?: boolean
}
export const changeNextdayCheck = (checked: boolean): ChangeNextdayCheckAction => (
    {
        type: ACTION_TYPE.CHECK_NEXTDAY,
        value: checked
    }
);

export type TrashReducerAction = AddTrashAction | ChangeScheduleAction | AddScheduleAction | DeleteScheduleAction | CahngeTrashTypeAction | ChangeInputAction | InputTrashTypeAction | DeleteTrashAction | SetSubmittingAction | SetUserInfoAction | SignOutAction | ErrorDialogAction | SigninDialogAction | ChangeMenuAction | NotificationDialogAction | AddExcludeDateAction | DeleteExcludeDateAction | SubmitExcludeDateAction | ChangeExcludeDateAction | InitExcludeDateAction | ResetExcludeSubmitAction | SetPresetAction | SetUserInfoAction | ChangeNextdayCheckAction;

export type ZipReducerAction =  SetZipcodeMessageAction | ChangeZipcodeAction | SubmitZipcodeAction | ChangeZipcodeStatusAction | SetErrorZipcodeAction | ChangePageAction | ChangePerPageAction;

export type UserReducerAction = NotificationDialogAction;

export type MenuReducerAction = ChangeMenuAction | SignOutAction;

export type LoginReducerAction = SetUserInfoAction | SignOutAction | SigninDialogAction;

export type ExcludeReducerAction = InitExcludeDateAction | AddExcludeDateAction | DeleteExcludeDateAction | ChangeExcludeDateAction;

export type SubmitReducerAction = ErrorDialogAction | SetSubmittingAction;

export type NextdayCheckReducerAction = ChangeNextdayCheckAction;