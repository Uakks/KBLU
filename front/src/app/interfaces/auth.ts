export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface OAuthRequest {
    token: string;
}

export interface RefreshRequest {
    refresh: string;
}

export interface RefreshResponse {
    access: string;
    refresh?: string;
}