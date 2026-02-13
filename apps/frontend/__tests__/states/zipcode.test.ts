import { reducer, initialState, Action, ZipcodeStatus } from '../../app/states/zipcode';

const dummyTrash = [{
    type: 'burn',
    trash_val: '',
    schedules: [{ type: 'weekday', value: '0' }],
    excludes: [],
    is_excludes_submitted: false,
    is_excludes_error: false
}];

describe('zipcode reducer', () => {
    test('changeZipcode sets value', () => {
        const s = reducer(initialState, { type: Action.changeZipcode, zipcode: '123' });
        expect(s.zipcode).toBe('123');
    });

    test('changeStatus to AddressSelect clones list', () => {
        const addresses = ['a', 'b'];
        const s = reducer(initialState, { type: Action.changeStatus, status: ZipcodeStatus.AddressSelect, value: addresses });
        expect(s.status).toBe(ZipcodeStatus.AddressSelect);
        expect(s.address_page_state.address_list).toEqual(addresses);
    });

    test('changeStatus to ResultSelect builds text list', () => {
        const trashList = [[...dummyTrash], [...dummyTrash]];
        const s = reducer(initialState, { type: Action.changeStatus, status: ZipcodeStatus.ResultSelect, value: trashList });
        expect(s.trash_page_state.trash_list.length).toBe(2);
        expect(s.trash_page_state.trash_text_list.length).toBe(2);
    });

    test('setError sets message', () => {
        const s = reducer(initialState, { type: Action.setError });
        expect(s.error).toBeDefined();
    });

    test('changePerPage respects status', () => {
        const state = { ...initialState, status: ZipcodeStatus.AddressSelect };
        const s = reducer(state, { type: Action.changePerPage, per_page: 10 });
        expect(s.address_page_state.per_page).toBe(10);
    });
});
