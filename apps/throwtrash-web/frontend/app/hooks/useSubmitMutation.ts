"use client";

import { useMutation } from '@tanstack/react-query';
import { submitTrashes } from '../../react/lib/api-client';

export function useSubmitMutation() {
    return useMutation({
        mutationKey: ['submitTrashes'],
        mutationFn: (payload: { data: any; globalExcludes: any; offset: number; nextdayflag: boolean }) => submitTrashes(payload)
    });
}
