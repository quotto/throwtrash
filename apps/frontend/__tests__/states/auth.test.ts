import { reducer, initialState, Action } from '../../app/states/auth';

describe('auth reducer', () => {
    test('setUser sets signedIn', () => {
        const s = reducer(initialState, { type: Action.setUser, user: { name: 'Bob' } });
        expect(s.signedIn).toBe(true);
        expect(s.user?.name).toBe('Bob');
    });
    test('signOut clears menu and user', () => {
        const s = reducer({ ...initialState, user: { name: 'Bob' }, signedIn: true, menu: { open: true, anchorEl: null } }, { type: Action.signOut });
        expect(s.signedIn).toBe(false);
        expect(s.user).toBeNull();
        expect(s.menu.open).toBe(false);
    });
    test('toggleSigninDialog updates flag', () => {
        const s = reducer(initialState, { type: Action.toggleSigninDialog, open: true });
        expect(s.signinDialog).toBe(true);
    });
    test('changeMenu sets anchor', () => {
        const anchor = {} as Element;
        const s = reducer(initialState, { type: Action.changeMenu, open: true, anchorEl: anchor });
        expect(s.menu.open).toBe(true);
        expect(s.menu.anchorEl).toBe(anchor);
    });
    test('notificationDialog toggles flag', () => {
        const s = reducer(initialState, { type: Action.notificationDialog, open: true });
        expect(s.notificationDialog).toBe(true);
    });
});
