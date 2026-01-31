import { reducer, initialState, Action, initialExcludeDate } from '../../app/states/exclude-date';

describe('exclude-date reducer', () => {
    test('init sets index and clones excludes', () => {
        const s = reducer(initialState, { type: Action.init, index: 1, excludes: [{ month: 2, date: 3 }] });
        expect(s.trashIndex).toBe(1);
        expect(s.excludes[0].month).toBe(2);
    });

    test('add caps at 10', () => {
        const many = { ...initialState, excludes: Array(10).fill(initialExcludeDate) };
        const s = reducer(many, { type: Action.add });
        expect(s.excludes.length).toBe(10);
    });

    test('del keeps at least one', () => {
        const s = reducer(initialState, { type: Action.del, index: 0 });
        expect(s.excludes.length).toBe(1);
    });

    test('change updates specific entry', () => {
        const s = reducer(initialState, { type: Action.change, index: 0, month: 5, date: 10 });
        expect(s.excludes[0]).toEqual({ month: 5, date: 10 });
    });
});
