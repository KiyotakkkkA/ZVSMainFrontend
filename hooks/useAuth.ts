"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from "@tanstack/react-query";
import {
    api,
    type AuthSession,
    type LoginSessionResponse,
    type RegisterSessionResponse,
    type CodeReceiveBody,
    type CodeVerifyBody,
    type AuthSessionsResponse,
    type AuthUser,
    type LoginBody,
    type RegisterBody,
} from "@/services/api";
import { userStore } from "@/stores/userStore";

export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
export const AUTH_SESSIONS_QUERY_KEY = ["auth", "sessions"] as const;

type AuthError = Error;

type AuthMutationOptions<TData, TPayload> = Omit<
    UseMutationOptions<TData, AuthError, TPayload>,
    "mutationFn"
>;

const toAuthUser = (value: unknown): AuthUser | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    const candidate = value as Partial<AuthUser>;

    if (
        typeof candidate.email !== "string" ||
        !Array.isArray(candidate.roles) ||
        typeof candidate.status !== "string"
    ) {
        return null;
    }

    return {
        id: typeof candidate.id === "string" ? candidate.id : undefined,
        email: candidate.email,
        roles: candidate.roles.filter(
            (role): role is string => typeof role === "string",
        ),
        status: candidate.status,
    };
};

export const useCodeSend = (
    options?: AuthMutationOptions<void, CodeReceiveBody>,
) => {
    const { onSuccess: externalOnSuccess, ...restOptions } = options ?? {};

    return useMutation<void, AuthError, CodeReceiveBody>({
        mutationFn: api.auth.codeRecieve,
        ...restOptions,
        onSuccess: (data, variables, onMutateResult, context) => {
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useCodeVerify = (
    options?: AuthMutationOptions<void, CodeVerifyBody>,
) => {
    const { onSuccess: externalOnSuccess, ...restOptions } = options ?? {};

    return useMutation<void, AuthError, CodeVerifyBody>({
        mutationFn: api.auth.codeVerify,
        ...restOptions,
        onSuccess: (data, variables, onMutateResult, context) => {
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useRegister = (
    options?: AuthMutationOptions<RegisterSessionResponse, RegisterBody>,
) => {
    const { onSuccess: externalOnSuccess, ...restOptions } = options ?? {};

    return useMutation<RegisterSessionResponse, AuthError, RegisterBody>({
        mutationFn: api.auth.register,
        ...restOptions,
        onSuccess: (data, variables, onMutateResult, context) => {
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useLogin = (
    options?: AuthMutationOptions<LoginSessionResponse, LoginBody>,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: externalOnSuccess, ...restOptions } = options ?? {};

    return useMutation<LoginSessionResponse, AuthError, LoginBody>({
        mutationFn: api.auth.login,
        ...restOptions,
        onSuccess: (data, variables, onMutateResult, context) => {
            const user = toAuthUser(data.user);

            userStore.setSession(data.accessToken, data.refreshToken, user);

            if (user) {
                queryClient.setQueryData(AUTH_ME_QUERY_KEY, user);
            } else {
                void queryClient.invalidateQueries({
                    queryKey: AUTH_ME_QUERY_KEY,
                });
            }

            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

type LogoutVariables = {
    refreshToken?: string;
};

export const useLogout = (
    options?: Omit<
        UseMutationOptions<void, AuthError, LogoutVariables>,
        "mutationFn"
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: externalOnSuccess, ...restOptions } = options ?? {};

    return useMutation<void, AuthError, LogoutVariables>({
        mutationFn: async (variables) => {
            const refreshToken =
                variables?.refreshToken ?? userStore.refreshToken;

            if (!refreshToken) {
                throw new Error("No refresh token found for logout");
            }

            return api.auth.logout({ refreshToken });
        },
        ...restOptions,
        onSuccess: (data, variables, onMutateResult, context) => {
            userStore.clearSession();
            queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useMe = (
    options?: Omit<
        UseQueryOptions<
            AuthUser,
            AuthError,
            AuthUser,
            typeof AUTH_ME_QUERY_KEY
        >,
        "queryKey" | "queryFn" | "enabled"
    >,
) => {
    return useQuery<AuthUser, AuthError, AuthUser, typeof AUTH_ME_QUERY_KEY>({
        queryKey: AUTH_ME_QUERY_KEY,
        queryFn: async () => {
            if (!userStore.accessToken && !userStore.refreshToken) {
                throw new Error("No auth tokens found");
            }

            const me = await api.auth.me();
            userStore.setUser(me);
            return me;
        },
        enabled: Boolean(userStore.accessToken || userStore.refreshToken),
        retry: false,
        ...options,
    });
};

export const useSessions = (
    options?: Omit<
        UseQueryOptions<
            AuthSessionsResponse,
            AuthError,
            AuthSession[],
            typeof AUTH_SESSIONS_QUERY_KEY
        >,
        "queryKey" | "queryFn" | "select"
    >,
) => {
    return useQuery<
        AuthSessionsResponse,
        AuthError,
        AuthSession[],
        typeof AUTH_SESSIONS_QUERY_KEY
    >({
        queryKey: AUTH_SESSIONS_QUERY_KEY,
        queryFn: () => api.auth.sessions(),
        select: (data) => data.sessions,
        enabled: Boolean(userStore.accessToken || userStore.refreshToken),
        retry: false,
        ...options,
    });
};

export const useRevokeSession = (
    options?: Omit<UseMutationOptions<void, AuthError, number>, "mutationFn">,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: externalOnSuccess, ...restOptions } = options ?? {};

    return useMutation<void, AuthError, number>({
        mutationFn: (sessionId) => api.auth.revokeSession(sessionId),
        ...restOptions,
        onSuccess: (data, variables, onMutateResult, context) => {
            void queryClient.invalidateQueries({
                queryKey: AUTH_SESSIONS_QUERY_KEY,
            });
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};
