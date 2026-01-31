"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { reducer as trashReducer, initialState as trashInitial } from '../states/trash-form';
import { reducer as submissionReducer, initialState as submissionInitial } from '../states/submission';
import { reducer as authReducer, initialState as authInitial, Action as AuthAction } from '../states/auth';
import { reducer as zipcodeReducer, initialState as zipcodeInitial, Action as ZipcodeAction } from '../states/zipcode';
import { reducer as excludeReducer, initialState as excludeInitial } from '../states/exclude-date';
import { useAuthQuery } from '../hooks/useAuthQuery';
import { useZipcodeQuery } from '../hooks/useZipcodeQuery';
import { ZipcodeStatusEnum } from '../states/types';

const TrashContext = createContext({ state: trashInitial, dispatch: (() => {}) as React.Dispatch<any> });
const SubmissionContext = createContext({ state: submissionInitial, dispatch: (() => {}) as React.Dispatch<any> });
const AuthContext = createContext({ state: authInitial, dispatch: (() => {}) as React.Dispatch<any> });
const ZipcodeContext = createContext({ state: zipcodeInitial, dispatch: (() => {}) as React.Dispatch<any> });
const ExcludeContext = createContext({ state: excludeInitial, dispatch: (() => {}) as React.Dispatch<any> });

export default function Providers({ children }: { children: ReactNode }) {
    const [trashState, dispatchTrash] = useReducer(trashReducer, trashInitial);
    const [submissionState, dispatchSubmission] = useReducer(submissionReducer, submissionInitial);
    const [authState, dispatchAuth] = useReducer(authReducer, authInitial);
    const [zipcodeState, dispatchZipcode] = useReducer(zipcodeReducer, zipcodeInitial);
    const [excludeState, dispatchExclude] = useReducer(excludeReducer, excludeInitial);

    // SSRでdehydrateされたauthを初期化
    const { data: authData } = useAuthQuery();
    React.useEffect(() => {
        if (authData && authData.name) {
            dispatchAuth({ type: AuthAction.setUser, user: { name: authData.name } });
        }
    }, [authData]);

    // zipcodeのSSRプリフェッチは行わずCSRのみ。react-query経由で検索。
    const zipcodeQuery = useZipcodeQuery(zipcodeState.zipcode, zipcodeState.submitting);
    React.useEffect(() => {
        if (!zipcodeState.submitting) return;
        if (zipcodeQuery.isFetched) {
            if (zipcodeQuery.data?.status === ZipcodeStatusEnum.AddressSelect) {
                dispatchZipcode({ type: ZipcodeAction.changeStatus, status: ZipcodeStatusEnum.AddressSelect, value: zipcodeQuery.data.addresses });
            } else if (zipcodeQuery.data?.status === ZipcodeStatusEnum.ResultSelect) {
                dispatchZipcode({ type: ZipcodeAction.changeStatus, status: ZipcodeStatusEnum.ResultSelect, value: zipcodeQuery.data.trashes });
            } else {
                dispatchZipcode({ type: ZipcodeAction.setError });
            }
            dispatchZipcode({ type: ZipcodeAction.submitZipcode, status: false });
        }
    }, [zipcodeState.submitting, zipcodeQuery.data, zipcodeQuery.isFetched, dispatchZipcode]);

    return (
        <TrashContext.Provider value={{ state: trashState, dispatch: dispatchTrash }}>
            <SubmissionContext.Provider value={{ state: submissionState, dispatch: dispatchSubmission }}>
                <AuthContext.Provider value={{ state: authState, dispatch: dispatchAuth }}>
                    <ZipcodeContext.Provider value={{ state: zipcodeState, dispatch: dispatchZipcode }}>
                        <ExcludeContext.Provider value={{ state: excludeState, dispatch: dispatchExclude }}>
                            {children}
                        </ExcludeContext.Provider>
                    </ZipcodeContext.Provider>
                </AuthContext.Provider>
            </SubmissionContext.Provider>
        </TrashContext.Provider>
    );
}

export const useTrashForm = () => useContext(TrashContext);
export const useSubmission = () => useContext(SubmissionContext);
export const useAuth = () => useContext(AuthContext);
export const useZipcode = () => useContext(ZipcodeContext);
export const useExcludeDate = () => useContext(ExcludeContext);
