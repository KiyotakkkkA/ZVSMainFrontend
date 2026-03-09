// DTOS
export type VectorStorageDTO = {
    id: string;
    name: string;
    createdAt: string;
    lastActiveAt: string;
    size: number;
    tags: VectorStorageTagDTO[];
};

export type VectorStorageTagDTO = {
    id: string;
    name: string;
};

// BODIES
export type CreateVectorStorageBody = {
    name: string;
};

export type UpdateVectorStorageBody = {
    name: string;
    tagIds?: string[];
};

export type CreateVectorStorageTagBody = {
    name: string;
};

// RESPONSES
export type VectorStorageListResponse = {
    storages: VectorStorageDTO[];
};

export type VectorStorageTagsResponse = {
    tags: VectorStorageTagDTO[];
};

export type VectorStorageResponse = VectorStorageDTO;

// PARAMS
export type ListVectorStoragesParams = {
    name?: string;
    tagIds?: string[];
};
