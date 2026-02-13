// 送信フロー用の簡易状態
import { SubmissionState } from './types';

export const initialState: SubmissionState = {
    submitting: false,
    showErrorDialog: false,
    nextdayChecked: true
};

export enum Action {
    start = 'start',
    success = 'success',
    fail = 'fail',
    toggleNextday = 'toggleNextday',
    setErrorDialog = 'setErrorDialog'
}

type SubmissionAction =
  | { type: Action.start }
  | { type: Action.success }
  | { type: Action.fail }
  | { type: Action.toggleNextday; value: boolean }
  | { type: Action.setErrorDialog; open: boolean };

export const reducer = (
    state: SubmissionState = initialState,
    action: SubmissionAction
): SubmissionState => {
    switch (action.type) {
    case Action.start:
        return { ...state, submitting: true, showErrorDialog: false };
    case Action.success:
        return { ...state, submitting: false, showErrorDialog: false };
    case Action.fail:
        return { ...state, submitting: false, showErrorDialog: true };
    case Action.toggleNextday:
        return { ...state, nextdayChecked: action.value };
    case Action.setErrorDialog:
        return { ...state, showErrorDialog: action.open, submitting: action.open ? false : state.submitting };
    default:
        return state;
    }
};
