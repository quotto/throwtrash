"use client";

import React, { ReactNode } from 'react';
import { QueryClientProvider, HydrationBoundary, DehydratedState } from '@tanstack/react-query';
import { makeQueryClient } from './queryClient';

export default function ReactQueryProvider({
    children,
    dehydratedState
}: {
    children: ReactNode;
    dehydratedState?: DehydratedState;
}) {
    const [queryClient] = React.useState(makeQueryClient);
    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydratedState}>
                {children}
            </HydrationBoundary>
        </QueryClientProvider>
    );
}
