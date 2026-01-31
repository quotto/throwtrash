import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Providers from '../../app/providers/StoreProvider';
import { GlobalExcludePageInner } from '../../app/exclude/global/page';

jest.mock('next/navigation', () => ({
    useRouter: () => ({ back: jest.fn() })
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
        expect(container.textContent).toContain('設定しました。');

        act(() => {
            root.unmount();
        });
        queryClient.clear();
        document.body.removeChild(container);
    });
});
