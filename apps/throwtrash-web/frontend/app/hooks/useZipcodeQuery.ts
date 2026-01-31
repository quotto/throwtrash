"use client";

import { useQuery } from '@tanstack/react-query';
import { searchZipcode, loadAddress } from '../../react/lib/api-client';
import { ZipcodeStatusEnum } from '../states/types';

type SearchResult =
  | { status: ZipcodeStatusEnum.None; addresses: []; trashes: [] }
  | { status: ZipcodeStatusEnum.AddressSelect; addresses: string[]; trashes: [] }
  | { status: ZipcodeStatusEnum.ResultSelect; addresses: []; trashes: any[][] };

export function useZipcodeQuery(zipcode: string, enabled: boolean) {
    return useQuery<SearchResult>({
        queryKey: ['zipcode', zipcode],
        queryFn: async () => {
            const res = await searchZipcode(zipcode);
            if (res.address.length === 0) {
                return { status: ZipcodeStatusEnum.None, addresses: [], trashes: [] };
            } else if (res.address.length === 1) {
                const load = await loadAddress(res.address[0]);
                return { status: ZipcodeStatusEnum.ResultSelect, addresses: [], trashes: load.data };
            } else {
                return { status: ZipcodeStatusEnum.AddressSelect, addresses: res.address, trashes: [] };
            }
        },
        enabled,
        staleTime: 0
    });
}
