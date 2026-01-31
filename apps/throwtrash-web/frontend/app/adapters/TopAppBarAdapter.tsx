"use client";

import React from 'react';
import TopAppBar from '../../react/components/TopAppBar';
import { useAuth, useTrashForm } from '../providers/StoreProvider';
import { Action as AuthAction } from '../states/auth';
import { Action as TrashAction } from '../states/trash-form';
import { signOut as signOutClient } from '../../react/lib/api-client';

export default function TopAppBarAdapter() {
    const { state: authState, dispatch: dispatchAuth } = useAuth();
    const { dispatch: dispatchTrash } = useTrashForm();

    return (
        <TopAppBar
            signedIn={authState.signedIn}
            userInfo={authState.user}
            signinDialog={authState.signinDialog}
            menu={authState.menu}
            openContact={false}
            notificationDialog={authState.notificationDialog}
            onSetUserInfo={(user, preset, globalExcludes) => {
                dispatchAuth({ type: AuthAction.setUser, user });
                dispatchTrash({ type: TrashAction.syncPreset, preset, globalExcludes });
            }}
            onSignOut={() => {
                signOutClient().catch(console.error);
                dispatchAuth({ type: AuthAction.signOut });
            }}
            onSigninDialog={(open) => dispatchAuth({ type: AuthAction.toggleSigninDialog, open })}
            onChangeMenu={(open, anchorEl) => dispatchAuth({ type: AuthAction.changeMenu, open, anchorEl })}
            onNotificationDialog={(open) => dispatchAuth({ type: AuthAction.notificationDialog, open })}
        />
    );
}
