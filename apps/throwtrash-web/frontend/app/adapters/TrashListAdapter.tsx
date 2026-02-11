"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import TrashList from '../../react/components/TrashList';
import { useSubmission, useTrashForm } from '../providers/StoreProvider';
import { Action as TrashAction } from '../states/trash-form';
import { Action as SubmissionAction } from '../states/submission';
import { submitTrashes } from '../../react/lib/api-client';

export default function TrashListAdapter() {
    const router = useRouter();
    const { state: trashState, dispatch: dispatchTrash } = useTrashForm();
    const { state: submissionState, dispatch: dispatchSubmission } = useSubmission();

    const handleSubmit = async () => {
        dispatchSubmission({ type: SubmissionAction.start });
        try {
            const res = await submitTrashes({
                data: trashState.trashes,
                globalExcludes: trashState.globalExcludes,
                offset: new Date().getTimezoneOffset(),
                nextdayflag: submissionState.nextdayChecked ?? true
            });
            dispatchSubmission({ type: SubmissionAction.success });
            if (res) {
                (window as any).location = res;
            }
        } catch {
            dispatchSubmission({ type: SubmissionAction.fail });
        }
    };

    const handleAddTrash = () => {
        if (trashState.trashes.length >= 10) {
            return;
        }
        const nextIndex = trashState.trashes.length;
        dispatchTrash({ type: TrashAction.addTrash });
        router.push(`/trash?trashIndex=${nextIndex}`);
    };

    return (
        <TrashList
            trashes={trashState.trashes}
            globalExcludes={trashState.globalExcludes}
            submit_error={trashState.error}
            showErrorDialog={submissionState.showErrorDialog}
            submitting={submissionState.submitting}
            nextday_checked={submissionState.nextdayChecked}
            onAddTrash={handleAddTrash}
            onDeleteTrash={(index) => dispatchTrash({ type: TrashAction.deleteTrash, index })}
            onSubmit={handleSubmit}
            onError={(open) => dispatchSubmission(open ? { type: SubmissionAction.fail } : { type: SubmissionAction.success })}
            onChangeNextdayCheck={(checked) => dispatchSubmission({ type: SubmissionAction.toggleNextday, value: checked })}
        />
    );
}
