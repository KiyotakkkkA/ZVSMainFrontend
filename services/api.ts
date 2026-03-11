import { userStore } from "@/stores/userStore";
import type {
    CreateVectorStorageBody,
    CreateVectorStorageTagBody,
    ListVectorStoragesParams,
    UpdateVectorStorageBody,
    VectorStorageListResponse,
    VectorStorageResponse,
    VectorStorageTagDTO,
    VectorStorageTagsResponse,
} from "@/dto/vector-storage.dto";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
    method: HttpMethod;
    endpoint: string;
    data?: unknown;
    accessToken?: string;
    auth?: boolean;
    skipRefresh?: boolean;
};

type ApiErrorPayload = {
    message?: string;
    [key: string]: unknown;
};

export class ApiError extends Error {
    status: number;
    payload?: ApiErrorPayload;

    constructor(status: number, message: string, payload?: ApiErrorPayload) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.payload = payload;
    }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const getHeaders = (accessToken?: string): HeadersInit => {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
};

const requestRaw = async ({
    method,
    endpoint,
    data,
    accessToken,
}: RequestOptions) => {
    return fetch(`${API_URL}${endpoint}`, {
        method,
        headers: getHeaders(accessToken),
        body: data === undefined ? undefined : JSON.stringify(data),
        credentials: "include",
    });
};

const parseResponse = async <T>(response: Response): Promise<T> => {
    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson
        ? ((await response.json()) as ApiErrorPayload)
        : undefined;

    if (!response.ok) {
        const message =
            typeof payload?.message === "string"
                ? payload.message
                : `Request failed with status ${response.status}`;

        throw new ApiError(response.status, message, payload);
    }

    return payload as T;
};

let refreshInFlight: Promise<string> | null = null;

const doRefresh = async (): Promise<string> => {
    const refreshToken = userStore.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "No refresh token found");
    }

    const response = await requestRaw({
        method: "POST",
        endpoint: "/auth/refresh",
        data: { refreshToken },
    });

    const session = await parseResponse<LoginSessionResponse>(response);

    userStore.setSession(
        session.accessToken,
        session.refreshToken ?? refreshToken,
    );

    return session.accessToken;
};

const refreshAccessToken = async () => {
    if (!refreshInFlight) {
        refreshInFlight = doRefresh().finally(() => {
            refreshInFlight = null;
        });
    }

    return refreshInFlight;
};

async function request<T>(options: RequestOptions): Promise<T> {
    const token =
        options.accessToken ??
        (options.auth ? (userStore.accessToken ?? undefined) : undefined);

    const response = await requestRaw({ ...options, accessToken: token });

    if (options.auth && response.status === 401 && !options.skipRefresh) {
        try {
            const nextToken = await refreshAccessToken();
            const retryResponse = await requestRaw({
                ...options,
                accessToken: nextToken,
                skipRefresh: true,
            });

            return parseResponse<T>(retryResponse);
        } catch (error) {
            userStore.clearSession();
            throw error;
        }
    }

    return parseResponse<T>(response);
}

export async function POST<T>(endpoint: string, data: T) {
    return await requestRaw({ method: "POST", endpoint, data });
}

export async function GET(endpoint: string) {
    return await requestRaw({ method: "GET", endpoint });
}

export async function PUT<T>(endpoint: string, data: T) {
    return await requestRaw({ method: "PUT", endpoint, data });
}

export async function DELETE(endpoint: string) {
    return await requestRaw({ method: "DELETE", endpoint });
}

export type UserRoles = "VIEWONLY" | "USER" | "ADMIN" | "ROOT";

export type AuthUser = {
    id?: string;
    email: string;
    role: UserRoles;
    status: string;
};

export type LoginSessionResponse = {
    accessToken: string;
    refreshToken: string;
    [key: string]: unknown;
};

export type RegisterSessionResponse = {
    verificationToken: string;
    [key: string]: unknown;
};

export type RegisterBody = {
    email: string;
    password: string;
    passwordConfirm: string;
};

export type CodeReceiveBody = {
    email: string;
    token: string;
};

export type CodeVerifyBody = {
    email: string;
    code: string;
    token: string;
};

export type LoginBody = {
    email: string;
    password: string;
};

export type LogoutBody = {
    refreshToken: string;
};

export type RefreshBody = {
    refreshToken: string;
};

export type AuthSession = {
    id: number;
    ipAddress: string;
    userAgent: string;
    device: string;
    deviceType: string;
    os: string;
    browser: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
};

export type AuthSessionsResponse = {
    sessions: AuthSession[];
};

export type {
    CreateVectorStorageBody,
    CreateVectorStorageTagBody,
    ListVectorStoragesParams,
    UpdateVectorStorageBody,
    VectorStorageDTO,
    VectorStorageListResponse,
    VectorStorageResponse,
    VectorStorageTagDTO,
    VectorStorageTagsResponse,
} from "@/dto/vector-storage.dto";

export const api = {
    auth: {
        register: (payload: RegisterBody) =>
            request<RegisterSessionResponse>({
                method: "POST",
                endpoint: "/auth/register",
                data: payload,
            }),
        login: (payload: LoginBody) =>
            request<LoginSessionResponse>({
                method: "POST",
                endpoint: "/auth/login",
                data: payload,
            }),
        codeRecieve: ({ email, token }: CodeReceiveBody) =>
            request<void>({
                method: "GET",
                endpoint: `/auth/verification/code?email=${email}&token=${token}`,
            }),
        codeVerify: ({ email, code, token }: CodeVerifyBody) =>
            request<void>({
                method: "POST",
                endpoint: `/auth/verification/code`,
                data: { email, code, token },
            }),
        refresh: (payload: RefreshBody) =>
            request<LoginSessionResponse>({
                method: "POST",
                endpoint: "/auth/refresh",
                data: payload,
                skipRefresh: true,
            }),
        me: () =>
            request<AuthUser>({
                method: "GET",
                endpoint: "/auth/me",
                auth: true,
            }),
        logout: (payload: LogoutBody) =>
            request<void>({
                method: "POST",
                endpoint: "/auth/logout",
                data: payload,
                auth: true,
            }),
        sessions: () =>
            request<AuthSessionsResponse>({
                method: "GET",
                endpoint: "/auth/sessions",
                auth: true,
            }),
        revokeSession: (sessionId: number) =>
            request<void>({
                method: "DELETE",
                endpoint: `/auth/sessions/${sessionId}`,
                auth: true,
            }),
    },

    vectorStorage: {
        list: (params?: ListVectorStoragesParams) => {
            const searchParams = new URLSearchParams();

            if (params?.name?.trim()) {
                searchParams.set("name", params.name.trim());
            }

            if (params?.tagIds?.length) {
                params.tagIds.forEach((tagId) => {
                    if (tagId) {
                        searchParams.append("tagIds", tagId);
                    }
                });
            }

            const query = searchParams.toString();

            return request<VectorStorageListResponse>({
                method: "GET",
                endpoint: query ? `/vstorages?${query}` : "/vstorages",
                auth: true,
            });
        },
        create: (payload: CreateVectorStorageBody) =>
            request<VectorStorageResponse>({
                method: "POST",
                endpoint: "/vstorages",
                data: payload,
                auth: true,
            }),
        update: (id: string, payload: UpdateVectorStorageBody) =>
            request<VectorStorageResponse>({
                method: "PUT",
                endpoint: `/vstorages/${encodeURIComponent(id)}`,
                data: payload,
                auth: true,
            }),
        delete: (id: string) =>
            request<void>({
                method: "DELETE",
                endpoint: `/vstorages/${encodeURIComponent(id)}`,
                auth: true,
            }),
        listTags: () =>
            request<VectorStorageTagsResponse>({
                method: "GET",
                endpoint: "/vstorages/tags",
                auth: true,
            }),
        createTag: (payload: CreateVectorStorageTagBody) =>
            request<VectorStorageTagDTO>({
                method: "POST",
                endpoint: "/vstorages/tags",
                data: payload,
                auth: true,
            }),
    },
};
