"use client";

import { useQuery } from '@tanstack/react-query';
import { apiBase } from '../../react/lib/env';

export const AUTH_QUERY_KEY = ['auth', 'session'];
const API_BASE = apiBase;

export function useAuthQuery() {
    return useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: async () => {
            try {
                if (!API_BASE) throw new Error('api base missing');
                const res = await fetch(`${API_BASE}/user_info`, { cache: 'no-store', credentials: 'include' });
                if (!res.ok) throw new Error('ng');
                const data = await res.json();
                return data;
            } catch {
                return null; // 未ログイン時はnullを返す
            }
        },
        staleTime: 5 * 60 * 1000,
        refetchOnMount: false
    });
}
