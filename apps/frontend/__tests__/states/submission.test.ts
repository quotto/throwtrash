import { reducer, initialState, Action } from '../../app/states/submission';

describe('submission reducer', () => {
    test('start sets submitting true and hides error', () => {
        const s = reducer(initialState, { type: Action.start });
        expect(s.submitting).toBe(true);
        expect(s.showErrorDialog).toBe(false);
    });
    test('success resets flags', () => {
        const s = reducer({ ...initialState, submitting: true, showErrorDialog: true }, { type: Action.success });
        expect(s.submitting).toBe(false);
        expect(s.showErrorDialog).toBe(false);
    });
    test('fail shows error', () => {
        const s = reducer({ ...initialState, submitting: true }, { type: Action.fail });
        expect(s.submitting).toBe(false);
        expect(s.showErrorDialog).toBe(true);
    });
    test('setErrorDialog toggles dialog', () => {
        const s = reducer(initialState, { type: Action.setErrorDialog, open: true });
        expect(s.showErrorDialog).toBe(true);
    });
    test('toggle nextday', () => {
        const s = reducer(initialState, { type: Action.toggleNextday, value: false });
        expect(s.nextdayChecked).toBe(false);
    });
});
