export type StorageView = "files" | "vectors";

export type StoredFile = {
    id: string;
    originalName: string;
    path: string;
    projectId?: string;
};

export type ProjectRef = {
    id: string;
    title: string;
};

export type VectorStorage = {
    id: string;
    name: string;
    createdAt: string;
    lastActiveAt: string;
    size: number;
    tags: string[];
};

export type PreparedVectorFile = {
    localId: string;
    name: string;
    source: "upload" | "storage";
};
