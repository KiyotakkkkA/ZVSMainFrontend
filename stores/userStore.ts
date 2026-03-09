import { makeAutoObservable } from "mobx";
import type { AuthUser } from "@/services/api";

const ACCESS_TOKEN_KEY = "zvs.accessToken";
const REFRESH_TOKEN_KEY = "zvs.refreshToken";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const readCookie = (key: string): string | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const cookie = window.document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${key}=`));

    if (!cookie) {
        return null;
    }

    const value = cookie.slice(key.length + 1);
    return value ? decodeURIComponent(value) : null;
};

const writeCookie = (key: string, value: string | null) => {
    if (typeof window === "undefined") {
        return;
    }

    if (value) {
        window.document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
        return;
    }

    window.document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
};

type PersistedSession = {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
};

class UserStore {
    accessToken: string | null = null;
    refreshToken: string | null = null;
    user: AuthUser | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
        this.hydrate();
    }

    get isAuthenticated() {
        return Boolean(this.accessToken);
    }

    setSession(
        accessToken: string,
        refreshToken: string,
        user: AuthUser | null = null,
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
        this.persist();
    }

    setUser(user: AuthUser | null) {
        this.user = user;
        this.persist();
    }

    clearSession() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        this.persist();
    }

    private hydrate() {
        if (typeof window === "undefined") {
            return;
        }

        const accessToken =
            window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
            readCookie(ACCESS_TOKEN_KEY);
        const refreshToken =
            window.localStorage.getItem(REFRESH_TOKEN_KEY) ??
            readCookie(REFRESH_TOKEN_KEY);

        if (accessToken) {
            this.accessToken = accessToken;
        }

        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
    }

    private persist() {
        if (typeof window === "undefined") {
            return;
        }

        if (this.accessToken) {
            window.localStorage.setItem(ACCESS_TOKEN_KEY, this.accessToken);
        } else {
            window.localStorage.removeItem(ACCESS_TOKEN_KEY);
        }

        writeCookie(ACCESS_TOKEN_KEY, this.accessToken);

        if (this.refreshToken) {
            window.localStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken);
        } else {
            window.localStorage.removeItem(REFRESH_TOKEN_KEY);
        }

        writeCookie(REFRESH_TOKEN_KEY, this.refreshToken);
    }

    toJSON(): PersistedSession {
        return {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            user: this.user,
        };
    }
}

export const userStore = new UserStore();
