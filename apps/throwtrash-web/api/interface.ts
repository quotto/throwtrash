import { TrashData } from "trash-common";

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
    preset: TrashData[] | null
}

export interface AccountLinkRequest {
    id: string,
    platform?: string
}

export interface RegisterItem {
    id: string,
    description: string,
    platform: string,
}

export interface AccountLinkItem {
    token: string,
    user_id: string,
    state: string,
    redirect_url : string,
    TTL: number
}

export interface TrashScheduleItem {
    id: string,
    description: string,
    platform?: string,
    shared_id?: string,
    timestamp?: number
}

export interface SharedScheduleItem {
    shared_id: string,
    description: string,
    timestamp: number
}

export interface RegisteredTrashScheduleItem {
    description: string,
    platform?: string
}

export interface ActivationCodeItem {
    code: string,
    shared_id: string,
    TTL: number
}

export interface ApiResponse {
    statusCode: 301
}

// TypeScriptのenumbは型安全ではないためユニオンを使う
export type  SKILL_STAGE =  "development" | "live";
