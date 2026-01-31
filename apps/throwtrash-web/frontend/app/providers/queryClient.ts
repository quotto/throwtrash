"use client";

import { QueryClient } from '@tanstack/react-query';

// SSR/CSR共通の初期化を行うQueryClient
export const makeQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1
            }
        }
    });
