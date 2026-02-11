import { reducer, initialState, Action, createInitialTrash } from '../../app/states/trash-form';

describe('trash-form reducer parity', () => {
    test('addTrash increases length and keeps error updated', () => {
        const state = reducer(initialState, { type: Action.addTrash });
        expect(state.trashes.length).toBe(2);
        expect(typeof state.error).toBe('boolean');
    });

    test('changeTrashKind resets trash_val and errors', () => {
        const state = reducer(initialState, { type: Action.changeTrashKind, index: 0, kind: 'other' });
        expect(state.trashes[0].type).toBe('other');
        expect(state.trashes[0].trash_val).toBe('');
    });

    test('changeScheduleType resets value and clears error', () => {
        const base = reducer(initialState, { type: Action.changeScheduleType, trashIndex: 0, scheduleIndex: 0, scheduleType: 'month' });
        expect(base.trashes[0].schedules[0].value).toBe('');
        expect(base.trashes[0].schedules[0].error).toBeUndefined();
    });

    test('changeScheduleValue validates month input', () => {
        const s1 = reducer(initialState, { type: Action.changeScheduleType, trashIndex: 0, scheduleIndex: 0, scheduleType: 'month' });
        const s2 = reducer(s1, { type: Action.changeScheduleValue, trashIndex: 0, scheduleIndex: 0, value: '' });
        expect(s2.trashes[0].schedules[0].error).toBe('missingvalue');
        const s3 = reducer(s1, { type: Action.changeScheduleValue, trashIndex: 0, scheduleIndex: 0, value: '10' });
        expect(s3.trashes[0].schedules[0].error).toBeUndefined();
    });

    test('syncPreset clones preset and keeps excludes defaulted', () => {
        const preset = [createInitialTrash(), { ...createInitialTrash(), excludes: undefined }];
        const s = reducer(initialState, { type: Action.syncPreset, preset, globalExcludes: [{ month: 1, date: 1 }] });
        expect(s.trashes.length).toBe(2);
        expect(Array.isArray(s.trashes[1].excludes)).toBe(true);
        expect(s.globalExcludes).toEqual([{ month: 1, date: 1 }]);
    });

    test('addSchedule caps at 3', () => {
        let s = reducer(initialState, { type: Action.addSchedule, trashIndex: 0 });
        s = reducer(s, { type: Action.addSchedule, trashIndex: 0 });
        s = reducer(s, { type: Action.addSchedule, trashIndex: 0 }); // should not exceed 3
        expect(s.trashes[0].schedules.length).toBe(3);
    });

    test('deleteSchedule keeps at least 1', () => {
        let s = reducer(initialState, { type: Action.addSchedule, trashIndex: 0 });
        s = reducer(s, { type: Action.deleteSchedule, trashIndex: 0, scheduleIndex: 0 });
        s = reducer(s, { type: Action.deleteSchedule, trashIndex: 0, scheduleIndex: 0 });
        expect(s.trashes[0].schedules.length).toBe(1);
    });

    test('deleteTrash keeps at least 1', () => {
        const s = reducer(initialState, { type: Action.deleteTrash, index: 0 });
        expect(s.trashes.length).toBe(1);
    });

    test('inputTrashType validates', () => {
        const s = reducer(initialState, { type: Action.changeTrashKind, index: 0, kind: 'other' });
        const s2 = reducer(s, { type: Action.inputTrashType, index: 0, value: '', maxlength: 10 });
        expect(s2.trashes[0].input_trash_type_error).toBe('missingvalue');
    });

    test('submitExclude sets flags', () => {
        const s = reducer(initialState, { type: Action.submitExclude, index: 0, excludes: [{ month: 2, date: 30 }] });
        expect(s.trashes[0].is_excludes_error).toBe(true);
        const s2 = reducer(initialState, { type: Action.submitExclude, index: 0, excludes: [{ month: 2, date: 20 }] });
        expect(s2.trashes[0].is_excludes_submitted).toBe(true);
    });

    test('resetExcludeSubmit clears flags', () => {
        const s = reducer({
            ...initialState,
            trashes: [{ ...createInitialTrash(), is_excludes_error: true, is_excludes_submitted: true }]
        }, { type: Action.resetExcludeSubmit, index: 0 });
        expect(s.trashes[0].is_excludes_error).toBe(false);
        expect(s.trashes[0].is_excludes_submitted).toBe(false);
    });

    test('submitGlobalExclude sets flags and updates globalExcludes', () => {
        const s = reducer(initialState, { type: Action.submitGlobalExclude, excludes: [{ month: 2, date: 30 }] });
        expect(s.is_global_excludes_error).toBe(true);
        const s2 = reducer(initialState, { type: Action.submitGlobalExclude, excludes: [{ month: 2, date: 20 }] });
        expect(s2.is_global_excludes_submitted).toBe(true);
        expect(s2.globalExcludes).toEqual([{ month: 2, date: 20 }]);
    });

    test('resetGlobalExcludeSubmit clears global flags', () => {
        const s = reducer({
            ...initialState,
            is_global_excludes_error: true,
            is_global_excludes_submitted: true
        }, { type: Action.resetGlobalExcludeSubmit });
        expect(s.is_global_excludes_error).toBe(false);
        expect(s.is_global_excludes_submitted).toBe(false);
    });
});
