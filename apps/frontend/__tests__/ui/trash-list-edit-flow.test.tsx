import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Providers from '../../app/providers/StoreProvider';
import TrashListAdapter from '../../app/adapters/TrashListAdapter';
import { TrashEditPageInner } from '../../app/trash/page';
import '../../react/lang/i18n';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock })
}));

describe('Trash list and edit flow', () => {
    beforeEach(() => {
        pushMock.mockClear();
    });

    test('list add navigates to edit screen', () => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const queryClient = new QueryClient();

        act(() => {
            root.render(
                <QueryClientProvider client={queryClient}>
                    <Providers>
                        <TrashListAdapter />
                    </Providers>
                </QueryClientProvider>
            );
        });

        const addButton = Array.from(container.querySelectorAll('button')).find((button) =>
            button.textContent?.includes('ゴミの種類を追加')
        ) as HTMLButtonElement;

        act(() => {
            addButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(pushMock).toHaveBeenCalledWith('/trash?trashIndex=1');

        act(() => {
            root.unmount();
        });
        queryClient.clear();
        document.body.removeChild(container);
    });

    test('edit save returns to list and delete is disabled when only one', () => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const queryClient = new QueryClient();

        act(() => {
            root.render(
                <QueryClientProvider client={queryClient}>
                    <Providers>
                        <TrashEditPageInner trashIndex={0} />
                    </Providers>
                </QueryClientProvider>
            );
        });

        const saveButton = container.querySelector('[aria-label="trash-edit-save"]') as HTMLButtonElement;

        act(() => {
            saveButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(pushMock).toHaveBeenCalledWith('/');

        const deleteButton = container.querySelector('[aria-label="trash-edit-delete"]') as HTMLButtonElement;

        expect(deleteButton.disabled).toBe(true);

        act(() => {
            root.unmount();
        });
        queryClient.clear();
        document.body.removeChild(container);
    });
});
