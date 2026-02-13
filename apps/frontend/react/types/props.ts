import { ExcludeDate, Trash, ZipcodeState } from '../../app/states/types';

export interface AppBarProps {
    signedIn: boolean;
    userInfo: { name: string } | null;
    signinDialog: boolean;
    menu: {
        open: boolean;
        anchorEl: Element | null;
    };
    openContact: boolean;
    notificationDialog?: boolean;
    onSetUserInfo: (user: { name: string }, preset: Trash[], globalExcludes?: ExcludeDate[]) => void;
    onSignOut: () => void;
    onSigninDialog: (open: boolean) => void;
    onChangeMenu: (open: boolean, anchorEl: Element | null) => void;
    onNotificationDialog: (open: boolean) => void;
}

export interface MainProps {
    trashes: Trash[];
    submit_error: boolean;
    showErrorDialog?: boolean;
    submitting: boolean;
    zipcodeState: ZipcodeState;
    globalExcludes: ExcludeDate[];
    nextday_checked?: boolean;
    onChangeTrash: (i: number, value: string, validate: Function[]) => void;
    onChangeSchedule: (i: number, j: number, value: string) => void;
    onChangeInput: (i: number, j: number, value: any) => void;
    onInputTrashType: (i: number, value: string, maxlength: number) => void;
    onClickAdd: () => void;
    onClickDelete: (i: number) => void;
    onError: (open: boolean) => void;
    onSubmit: (status: boolean) => void;
    addSchedule: (trash_index: number) => void;
    deleteSchedule: (trash_index: number, schedule_index: number) => void;
    setZipcodeMessage: (message: string) => void;
    changeZipcode: (value: string) => void;
    submitZipcode: (status: boolean) => void;
    changeZipcodeStatus: (status: number, value: string[] | Trash[][]) => void;
    setErrorZipcode: () => void;
    setPreset: (preset: Trash[]) => void;
    changePage: (page: number) => void;
    changePerPage: (per_page: number) => void;
    onChangeNextdayCheck: (checked: boolean) => void;
}
