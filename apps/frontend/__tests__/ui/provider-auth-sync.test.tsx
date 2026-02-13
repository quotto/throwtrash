import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Providers, { useAuth, useTrashForm } from '../../app/providers/StoreProvider';

const authQueryData = {
    name: 'tester',
    preset: [],
    globalExcludes: [{ month: 4, date: 1 }]
};

jest.mock('../../app/hooks/useAuthQuery', () => ({
    useAuthQuery: () => ({
        data: authQueryData
    })
}));

jest.mock('../../app/hooks/useZipcodeQuery', () => ({
    useZipcodeQuery: () => ({ isFetched: false, data: null })
}));

function Observer() {
    const { state: authState } = useAuth();
    const { state: trashState } = useTrashForm();

    return (
        <div>
            <span data-testid="signed-in">{String(authState.signedIn)}</span>
            <span data-testid="global-excludes">{trashState.globalExcludes.length}</span>
        </div>
    );
}

describe('StoreProvider auth sync', () => {
    test('useAuthQuery result syncs auth and globalExcludes', async () => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        await act(async () => {
            root.render(
                <Providers>
                    <Observer />
                </Providers>
            );
        });

        expect((container.querySelector('[data-testid="signed-in"]') as HTMLSpanElement).textContent).toBe('true');
        expect((container.querySelector('[data-testid="global-excludes"]') as HTMLSpanElement).textContent).toBe('1');

        act(() => {
            root.unmount();
        });
        document.body.removeChild(container);
    });
});
