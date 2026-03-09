"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from "@tanstack/react-query";
import { userStore } from "@/stores/userStore";
import {
    api,
    type VectorStorageListResponse,
    type VectorStorageResponse,
    type VectorStorageTagsResponse,
} from "@/services/api";
import type { PreparedVectorFile } from "@/components/molecules/storage/types";
import type {
    CreateVectorStorageBody,
    CreateVectorStorageTagBody,
    ListVectorStoragesParams,
    UpdateVectorStorageBody,
    VectorStorageDTO,
    VectorStorageTagDTO,
} from "@/dto/vector-storage.dto";

type StorageError = Error;

export const VECTOR_STORAGES_QUERY_KEY = ["vector-storages"] as const;
export const VECTOR_STORAGE_TAGS_QUERY_KEY = ["vector-storage-tags"] as const;

export const useVectorStorages = (
    params?: ListVectorStoragesParams,
    options?: Omit<
        UseQueryOptions<
            VectorStorageListResponse,
            StorageError,
            VectorStorageDTO[],
            readonly [
                ...typeof VECTOR_STORAGES_QUERY_KEY,
                { name?: string; tagIds?: string[] },
            ]
        >,
        "queryKey" | "queryFn" | "select"
    >,
) => {
    const normalizedParams = {
        name: params?.name?.trim() || undefined,
        tagIds:
            params?.tagIds && params.tagIds.length > 0
                ? [...params.tagIds].sort()
                : undefined,
    };

    return useQuery<
        VectorStorageListResponse,
        StorageError,
        VectorStorageDTO[],
        readonly [
            ...typeof VECTOR_STORAGES_QUERY_KEY,
            { name?: string; tagIds?: string[] },
        ]
    >({
        queryKey: [...VECTOR_STORAGES_QUERY_KEY, normalizedParams],
        queryFn: () => api.vectorStorage.list(normalizedParams),
        select: (data) => data.storages,
        retry: false,
        ...options,
    });
};

export const useVectorStorageTags = (
    options?: Omit<
        UseQueryOptions<
            VectorStorageTagsResponse,
            StorageError,
            VectorStorageTagDTO[],
            typeof VECTOR_STORAGE_TAGS_QUERY_KEY
        >,
        "queryKey" | "queryFn" | "select"
    >,
) => {
    return useQuery<
        VectorStorageTagsResponse,
        StorageError,
        VectorStorageTagDTO[],
        typeof VECTOR_STORAGE_TAGS_QUERY_KEY
    >({
        queryKey: VECTOR_STORAGE_TAGS_QUERY_KEY,
        queryFn: () => api.vectorStorage.listTags(),
        select: (data) => data.tags,
        retry: false,
        ...options,
    });
};

export const useCreateVectorStorage = (
    options?: Omit<
        UseMutationOptions<
            VectorStorageResponse,
            StorageError,
            CreateVectorStorageBody
        >,
        "mutationFn"
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: externalOnSuccess, ...rest } = options ?? {};

    return useMutation<
        VectorStorageResponse,
        StorageError,
        CreateVectorStorageBody
    >({
        mutationFn: (payload) => api.vectorStorage.create(payload),
        ...rest,
        onSuccess: (data, variables, onMutateResult, context) => {
            void queryClient.invalidateQueries({
                queryKey: VECTOR_STORAGES_QUERY_KEY,
            });
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export type UpdateVectorStorageVariables = {
    id: string;
} & UpdateVectorStorageBody;

export const useUpdateVectorStorage = (
    options?: Omit<
        UseMutationOptions<
            VectorStorageResponse,
            StorageError,
            UpdateVectorStorageVariables
        >,
        "mutationFn"
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: externalOnSuccess, ...rest } = options ?? {};

    return useMutation<
        VectorStorageResponse,
        StorageError,
        UpdateVectorStorageVariables
    >({
        mutationFn: ({ id, name, tagIds }) =>
            api.vectorStorage.update(id, { name, tagIds }),
        ...rest,
        onSuccess: (data, variables, onMutateResult, context) => {
            void queryClient.invalidateQueries({
                queryKey: VECTOR_STORAGES_QUERY_KEY,
            });
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useDeleteVectorStorage = (
    options?: Omit<
        UseMutationOptions<void, StorageError, string>,
        "mutationFn"
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: externalOnSuccess, ...rest } = options ?? {};

    return useMutation<void, StorageError, string>({
        mutationFn: (id) => api.vectorStorage.delete(id),
        ...rest,
        onSuccess: (data, variables, onMutateResult, context) => {
            void queryClient.invalidateQueries({
                queryKey: VECTOR_STORAGES_QUERY_KEY,
            });
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export const useCreateVectorStorageTags = (
    options?: Omit<
        UseMutationOptions<
            VectorStorageTagDTO,
            StorageError,
            CreateVectorStorageTagBody
        >,
        "mutationFn"
    >,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: externalOnSuccess, ...rest } = options ?? {};

    return useMutation<
        VectorStorageTagDTO,
        StorageError,
        CreateVectorStorageTagBody
    >({
        mutationFn: (payload) => api.vectorStorage.createTag(payload),
        ...rest,
        onSuccess: (data, variables, onMutateResult, context) => {
            void queryClient.invalidateQueries({
                queryKey: VECTOR_STORAGES_QUERY_KEY,
            });
            void queryClient.invalidateQueries({
                queryKey: VECTOR_STORAGE_TAGS_QUERY_KEY,
            });
            externalOnSuccess?.(data, variables, onMutateResult, context);
        },
    });
};

export type RunVectorEmbeddingsVariables = {
    vstoreUuid: string;
    documents: PreparedVectorFile[];
};

export const useRunVectorEmbeddings = (
    options?: Omit<
        UseMutationOptions<void, StorageError, RunVectorEmbeddingsVariables>,
        "mutationFn"
    >,
) => {
    return useMutation<void, StorageError, RunVectorEmbeddingsVariables>({
        mutationFn: async ({ vstoreUuid, documents }) => {
            if (!vstoreUuid) {
                throw new Error("Не выбрано векторное хранилище");
            }

            if (documents.length === 0) {
                throw new Error("Нет документов для индексации");
            }

            const formData = new FormData();

            documents.forEach((document) => {
                formData.append("documents[]", document.name);
                formData.append("documentSources[]", document.source);

                if (document.source === "upload" && document.file) {
                    formData.append("files", document.file, document.file.name);
                }

                if (document.source === "storage" && document.storageFileId) {
                    formData.append("storageFileIds[]", document.storageFileId);
                }
            });

            const token = userStore.accessToken;
            const headers: HeadersInit = token
                ? { Authorization: `Bearer ${token}` }
                : {};

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/vstorages/${encodeURIComponent(vstoreUuid)}/embeddings`,
                {
                    method: "POST",
                    headers,
                    body: formData,
                    credentials: "include",
                },
            );

            if (!response.ok) {
                let message = `Request failed with status ${response.status}`;

                try {
                    const payload = (await response.json()) as {
                        message?: string;
                    };

                    if (typeof payload?.message === "string") {
                        message = payload.message;
                    }
                } catch {
                    // Non-JSON response fallback.
                }

                throw new Error(message);
            }
        },
        ...options,
    });
};
