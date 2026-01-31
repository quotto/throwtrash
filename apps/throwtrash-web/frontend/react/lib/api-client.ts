/* クライアント側で既存APIを呼び出すヘルパー（fetchベース） */
import { apiBase } from './env';
const API_BASE = apiBase;
const jsonInit: RequestInit = {
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
};

export async function getUserInfo() {
    if (!API_BASE) throw new Error('API base not set');
    const res = await fetch(`${API_BASE}/user_info`, { ...jsonInit, cache: 'no-store' });
    if (!res.ok) throw new Error('user_info failed');
    return res.json();
}

export async function signOut() {
    if (!API_BASE) throw new Error('API base not set');
    const res = await fetch(`${API_BASE}/signout`, { ...jsonInit, cache: 'no-store' });
    if (!res.ok) throw new Error('signout failed');
    return true;
}

export async function submitTrashes(payload: { data: any; globalExcludes: any; offset: number; nextdayflag: boolean }) {
    if (!API_BASE) throw new Error('API base not set');
    const res = await fetch(`${API_BASE}/regist`, { ...jsonInit, method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('regist failed');
    return res.text();
}

// 外部サービス（ZIPコード）は従来どおり直接呼び出し
export async function searchZipcode(zipcode: string) {
    const res = await fetch(`https://zipcode.mythrowaway.net/search?zipcode=${zipcode}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('zipcode search failed');
    return res.json();
}

export async function loadAddress(address: string) {
    const res = await fetch(`https://zipcode.mythrowaway.net/load?address=${encodeURIComponent(address)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('zipcode load failed');
    return res.json();
}
