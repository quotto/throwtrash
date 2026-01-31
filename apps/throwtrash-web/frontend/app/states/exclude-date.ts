// 除外日編集用の一時状態。現行ExcludeDateReducerを踏襲。
import { ExcludeDateState, ExcludeDate } from './types';

export const initialExcludeDate: ExcludeDate = { month: 1, date: 1 };

export const initialState: ExcludeDateState = {
    trashIndex: -1,
    excludes: [initialExcludeDate]
};

export enum Action {
    init = 'init',
    add = 'add',
    del = 'del',
    change = 'change'
}

type ExcludeAction =
  | { type: Action.init; index: number; excludes: ExcludeDate[] }
  | { type: Action.add }
  | { type: Action.del; index: number }
  | { type: Action.change; index: number; month: number; date: number };

export const reducer = (
    state: ExcludeDateState = initialState,
    action: ExcludeAction
): ExcludeDateState => {
    const newState: ExcludeDateState = { ...state };
    switch (action.type) {
    case Action.init:
        return {
            trashIndex: action.index,
            excludes: action.excludes && action.excludes.length > 0 ? JSON.parse(JSON.stringify(action.excludes)) : [initialExcludeDate]
        };
    case Action.add:
        if (newState.excludes.length < 10) {
            newState.excludes = [...newState.excludes, initialExcludeDate];
        }
        return newState;
    case Action.del:
        if (newState.excludes.length > 1) {
            newState.excludes = newState.excludes.filter((_, idx) => idx !== action.index);
        }
        return newState;
    case Action.change:
        newState.excludes = newState.excludes.map((ex, idx) =>
            idx === action.index ? { month: action.month, date: action.date } : ex);
        return newState;
    default:
        return state;
    }
};
