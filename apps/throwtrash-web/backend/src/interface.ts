import type { ExcludeDate, TrashData } from "trash-common";

export interface BackendResponse {
    statusCode: number, 
    headers?:{
        Location?: string,
        "Set-Cookie"?: string,
        "Cache-Control"?: string,
        "Access-Control-Allow-Origin"?: string,                    "Access-Control-Allow-Credentials"?: boolean,
        "Content-Type"?: string,
    },
    body?: string
}

export interface AccessTokenItem {
    expires_in: number,
    user_id: string,
    client_id: string,
    access_token?: string
}

export interface RefreshTokenItem {
    refresh_token: string
    expires_in: number,
    user_id: string,
    client_id: string,
}

export interface CodeItem {
    code: string,
    user_id: string,
    client_id: string,
    redirect_uri: string,
    expires_in: number
}

export interface UserInfo {
    name: string,
    signinId: string,
    signinService: string,
    id?: string,
    preset: TrashData[] | null,
    globalExcludes?: ExcludeDate[]
}

export interface SessionItem {
    id: string,
    expire: number,
    state?: string,
    client_id?: string,
    platform?: string,
    redirect_uri?: string,
    googleState?: string,
    user_id?: any,
    userInfo?: UserInfo
}

export interface RawTrasScheduleItem {
    id: string,
    description: string,
    globalExcludes?: ExcludeDate[],
    platform?: string,
    signinId?: string,
    signinService?: string,
    timestamp?: number
}
