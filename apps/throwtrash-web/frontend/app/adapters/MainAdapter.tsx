"use client";

import React from 'react';
import Main from '../../react/components/Main';
import { useTrashForm, useSubmission, useZipcode } from '../providers/StoreProvider';
import { Action as TrashAction } from '../states/trash-form';
import { Action as SubmissionAction } from '../states/submission';
import { Action as ZipAction } from '../states/zipcode';
import { useSubmitMutation } from '../hooks/useSubmitMutation';

export default function MainAdapter() {
    const { state: trashState, dispatch: dispatchTrash } = useTrashForm();
    const { state: submissionState, dispatch: dispatchSubmission } = useSubmission();
    const { state: zipcodeState, dispatch: dispatchZip } = useZipcode();
    const submitMutation = useSubmitMutation();

    return (
        <Main
            trashes={trashState.trashes}
            globalExcludes={trashState.globalExcludes}
            submit_error={trashState.error}
            showErrorDialog={submissionState.showErrorDialog}
            submitting={submissionState.submitting}
            zipcodeState={zipcodeState}
            nextday_checked={submissionState.nextdayChecked}
            onChangeTrash={(i, value) => dispatchTrash({ type: TrashAction.changeTrashKind, index: i, kind: value })}
            onChangeSchedule={(i, j, value) => dispatchTrash({ type: TrashAction.changeScheduleType, trashIndex: i, scheduleIndex: j, scheduleType: value })}
            onChangeInput={(i, j, value) => dispatchTrash({ type: TrashAction.changeScheduleValue, trashIndex: i, scheduleIndex: j, value })}
            onInputTrashType={(i, value, maxlength) => dispatchTrash({ type: TrashAction.inputTrashType, index: i, value, maxlength })}
            onClickAdd={() => dispatchTrash({ type: TrashAction.addTrash })}
            onClickDelete={(i) => dispatchTrash({ type: TrashAction.deleteTrash, index: i })}
            onError={(open) => dispatchSubmission(open ? { type: SubmissionAction.fail } : { type: SubmissionAction.success })}
            onSubmit={async (status) => {
                if (!status) {
                    dispatchSubmission({ type: SubmissionAction.success });
                    return;
                }
                dispatchSubmission({ type: SubmissionAction.start });
                try {
                    const res = await submitMutation.mutateAsync({
                        data: trashState.trashes,
                        globalExcludes: trashState.globalExcludes,
                        offset: new Date().getTimezoneOffset(),
                        nextdayflag: submissionState.nextdayChecked ?? true
                    });
                    // 既存仕様: responseがURL文字列
                    if (res) {
                        (window as any).location = res;
                    }
                } catch {
                    dispatchSubmission({ type: SubmissionAction.setErrorDialog, open: true });
                }
            }}
            addSchedule={(idx) => dispatchTrash({ type: TrashAction.addSchedule, trashIndex: idx })}
            deleteSchedule={(ti, si) => dispatchTrash({ type: TrashAction.deleteSchedule, trashIndex: ti, scheduleIndex: si })}
            setZipcodeMessage={(message) => dispatchZip({ type: ZipAction.setMessage, message })}
            changeZipcode={(value) => dispatchZip({ type: ZipAction.changeZipcode, zipcode: value })}
            submitZipcode={(status) => dispatchZip({ type: ZipAction.submitZipcode, status })}
            changeZipcodeStatus={(status, value) => dispatchZip({ type: ZipAction.changeStatus, status, value })}
            setErrorZipcode={() => dispatchZip({ type: ZipAction.setError })}
            setPreset={(preset) => dispatchTrash({ type: TrashAction.syncPreset, preset })}
            changePage={(page) => dispatchZip({ type: ZipAction.changePage, page })}
            changePerPage={(per_page) => dispatchZip({ type: ZipAction.changePerPage, per_page })}
            onChangeNextdayCheck={(checked) => dispatchSubmission({ type: SubmissionAction.toggleNextday, value: checked })}
        />
    );
}
