"use client";

import React from 'react';
import dynamicImport from 'next/dynamic';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import '../react/lang/i18n';

const TopAppBarAdapter = dynamicImport(() => import('./adapters/TopAppBarAdapter'), { ssr: false });
const TrashListAdapter = dynamicImport(() => import('./adapters/TrashListAdapter'), { ssr: false });

export const dynamic = "force-dynamic";

export default function Page() {
    const theme = React.useMemo(() => createTheme({}), []);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <main>
                <TopAppBarAdapter />
                <TrashListAdapter />
            </main>
        </ThemeProvider>
    );
}
