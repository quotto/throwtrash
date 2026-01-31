// 認証・メニュー・通知状態。既存LoginReducer/MenuReducer/UserReducerの統合版。
import { AuthState } from './types';

export const initialState: AuthState = {
    user: null,
    signedIn: false,
    signinDialog: false,
    menu: { open: false, anchorEl: null },
    notificationDialog: false
};

export enum Action {
    setUser = 'setUser',
    signOut = 'signOut',
    toggleSigninDialog = 'toggleSigninDialog',
    changeMenu = 'changeMenu',
    notificationDialog = 'notificationDialog'
}

type AuthAction =
  | { type: Action.setUser; user: { name: string } | null }
  | { type: Action.signOut }
  | { type: Action.toggleSigninDialog; open: boolean }
  | { type: Action.changeMenu; open: boolean; anchorEl?: Element | null }
  | { type: Action.notificationDialog; open: boolean };

export const reducer = (
    state: AuthState = initialState,
    action: AuthAction
): AuthState => {
    switch (action.type) {
    case Action.setUser:
        return { ...state, user: action.user, signedIn: !!action.user };
    case Action.signOut:
        return { ...state, user: null, signedIn: false, menu: { open: false, anchorEl: null } };
    case Action.toggleSigninDialog:
        return { ...state, signinDialog: action.open };
    case Action.changeMenu:
        return { ...state, menu: { open: action.open, anchorEl: action.anchorEl ?? null } };
    case Action.notificationDialog:
        return { ...state, notificationDialog: action.open };
    default:
        return state;
    }
};
