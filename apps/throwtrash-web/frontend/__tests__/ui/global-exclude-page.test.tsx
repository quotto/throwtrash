import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Providers, { useTrashForm } from '../../app/providers/StoreProvider';
import { GlobalExcludePageInner } from '../../app/exclude/global/page';
import { Action as TrashAction } from '../../app/states/trash-form';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ back: jest.fn(), push: pushMock })
}));

describe('GlobalExcludePage', () => {
    test('add and submit updates UI', () => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const queryClient = new QueryClient();

        act(() => {
            root.render(
                <QueryClientProvider client={queryClient}>
                    <Providers>
                        <GlobalExcludePageInner />
                    </Providers>
                </QueryClientProvider>
            );
        });

        expect(container.querySelectorAll('[data-testid="global-exclude-row"]').length).toBe(1);

        const addButton = container.querySelector('[aria-label="global-exclude-add"]') as HTMLButtonElement;
        act(() => {
            addButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        expect(container.querySelectorAll('[data-testid="global-exclude-row"]').length).toBe(2);

        const submitButton = container.querySelector('[aria-label="global-exclude-submit"]') as HTMLButtonElement;
        act(() => {
            submitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        expect(pushMock).toHaveBeenCalledWith('/');

        act(() => {
            root.unmount();
        });
        queryClient.clear();
        document.body.removeChild(container);
    });

    test('syncPresetのglobalExcludesを反映する', async () => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const queryClient = new QueryClient();

        const TestHarness = () => {
            const { dispatch } = useTrashForm();
            React.useEffect(() => {
                dispatch({
                    type: TrashAction.syncPreset,
                    preset: [],
                    globalExcludes: [
                        { month: 1, date: 1 },
                        { month: 2, date: 2 }
                    ]
                });
            }, [dispatch]);
            return <GlobalExcludePageInner />;
        };

        await act(async () => {
            root.render(
                <QueryClientProvider client={queryClient}>
                    <Providers>
                        <TestHarness />
                    </Providers>
                </QueryClientProvider>
            );
        });
        await act(async () => {
            await Promise.resolve();
        });

        expect(container.querySelectorAll('[data-testid="global-exclude-row"]').length).toBe(2);

        act(() => {
            root.unmount();
        });
        queryClient.clear();
        document.body.removeChild(container);
    });
});
