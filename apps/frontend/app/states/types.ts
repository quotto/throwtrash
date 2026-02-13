export type EvWeek = { weekday: string; start: string; interval: number };
export type ScheduleValue = string | EvWeek;
export type Schedule = {
  type: 'none' | 'weekday' | 'biweek' | 'month' | 'evweek';
  value: ScheduleValue;
  error?: string;
};
export type ExcludeDate = { month: number; date: number };
export type Trash = {
  type:
    | 'burn'
    | 'unburn'
    | 'plastic'
    | 'bin'
    | 'can'
    | 'petbottle'
    | 'paper'
    | 'resource'
    | 'coarse'
    | 'other';
  trash_val: string;
  schedules: Schedule[];
  excludes: ExcludeDate[];
  trash_type_error?: boolean | string;
  input_trash_type_error?: boolean | string;
  is_excludes_submitted: boolean;
  is_excludes_error: boolean;
};

export type TrashFormState = {
  trashes: Trash[];
  error: boolean;
  globalExcludes: ExcludeDate[];
  is_global_excludes_submitted: boolean;
  is_global_excludes_error: boolean;
};
export type TrashFormAction =
  | { type: 'addTrash' }
  | { type: 'changeTrashKind'; index: number; kind: Trash['type'] }
  | {
      type: 'changeScheduleType';
      trashIndex: number;
      scheduleIndex: number;
      scheduleType: Schedule['type'];
    }
  | {
      type: 'changeScheduleValue';
      trashIndex: number;
      scheduleIndex: number;
      value: ScheduleValue;
    }
  | { type: 'addSchedule'; trashIndex: number }
  | { type: 'deleteSchedule'; trashIndex: number; scheduleIndex: number }
  | { type: 'deleteTrash'; index: number }
  | { type: 'syncPreset'; preset: Trash[]; globalExcludes?: ExcludeDate[] }
  | { type: 'inputTrashType'; index: number; value: string; maxlength: number }
  | { type: 'resetExcludeSubmit'; index: number }
  | { type: 'submitExclude'; index: number; excludes: ExcludeDate[] }
  | { type: 'resetGlobalExcludeSubmit' }
  | { type: 'submitGlobalExclude'; excludes: ExcludeDate[] };

export type SubmissionState = {
  submitting: boolean;
  showErrorDialog: boolean;
  nextdayChecked: boolean;
};

export type AuthState = {
  user: { name: string } | null;
  signedIn: boolean;
  signinDialog: boolean;
  menu: { open: boolean; anchorEl: Element | null };
  notificationDialog: boolean;
};

export enum ZipcodeStatusEnum {
  None = 0,
  AddressSelect = 1,
  ResultSelect = 2
}

export type ZipcodeState = {
  zipcode: string;
  submitting: boolean;
  status: ZipcodeStatusEnum;
  address_page_state: { per_page: number; current_page: number; address_list: string[] };
  trash_page_state: { per_page: number; current_page: number; trash_list: Trash[][]; trash_text_list: string[] };
  error?: string;
  message?: string;
};

export type ExcludeDateState = { trashIndex: number; excludes: ExcludeDate[] };
