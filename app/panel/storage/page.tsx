"use client";
import { useMemo, useState } from "react";
import { StorageViewSwitcher } from "@/components/molecules/storage/StorageViewSwitcher";
import type {
    PreparedVectorFile,
    ProjectRef,
    StoredFile,
    StorageView,
    VectorStorage,
} from "@/components/molecules/storage/types";
import { StorageFilesView } from "@/components/organisms/storage/StorageFilesView";
import { StorageModals } from "@/components/organisms/storage/StorageModals";
import { StorageVectorsView } from "@/components/organisms/storage/StorageVectorsView";

const STORAGE_VIEW_OPTIONS = [
    { value: "files", label: "Файлы" },
    { value: "vectors", label: "Векторные хранилища" },
];

const MOCK_PROJECTS: ProjectRef[] = [
    { id: "prj-1", title: "Отдел продаж" },
    { id: "prj-2", title: "Юридический блок" },
    { id: "prj-3", title: "Поддержка" },
];

const MOCK_FILES: StoredFile[] = [
    {
        id: "file-101",
        originalName: "contract_template.docx",
        path: "C:/data/storage/contracts/contract_template.docx",
        projectId: "prj-2",
    },
    {
        id: "file-102",
        originalName: "knowledge_base.pdf",
        path: "C:/data/storage/docs/knowledge_base.pdf",
        projectId: "prj-1",
    },
    {
        id: "file-103",
        originalName: "faq_internal.pdf",
        path: "C:/data/storage/docs/faq_internal.pdf",
    },
];

const MOCK_VECTOR_STORAGES: VectorStorage[] = [
    {
        id: "vec-1",
        name: "База договоров",
        createdAt: "2026-03-05T10:00:00.000Z",
        lastActiveAt: "2026-03-06T07:30:00.000Z",
        dataPath: "C:/data/vectors/contracts/index.faiss",
        size: 93_184_000,
        tags: ["contracts", "legal"],
    },
    {
        id: "vec-2",
        name: "Справочник FAQ",
        createdAt: "2026-03-04T15:20:00.000Z",
        lastActiveAt: "2026-03-06T08:10:00.000Z",
        dataPath: "C:/data/vectors/faq/index.faiss",
        size: 48_200_000,
        tags: ["faq", "support"],
    },
];

const VECTOR_TAG_OPTIONS = [
    { value: "contracts", label: "Contracts" },
    { value: "legal", label: "Legal" },
    { value: "faq", label: "FAQ" },
    { value: "support", label: "Support" },
    { value: "docs", label: "Docs" },
];

const formatDateTime = (dateValue: string) => {
    return new Intl.DateTimeFormat("ru-RU", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(dateValue));
};

const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
};

export default function StoragePage() {
    const [activeView, setActiveView] = useState<StorageView>("files");
    const [files, setFiles] = useState<StoredFile[]>(MOCK_FILES);
    const [vectorStorages, setVectorStorages] =
        useState<VectorStorage[]>(MOCK_VECTOR_STORAGES);

    const [selectedFileId, setSelectedFileId] = useState<string>(
        MOCK_FILES[0]?.id ?? "",
    );
    const [selectedVectorStorageId, setSelectedVectorStorageId] =
        useState<string>(MOCK_VECTOR_STORAGES[0]?.id ?? "");

    const [fileSearchQuery, setFileSearchQuery] = useState("");
    const [vectorSearchQuery, setVectorSearchQuery] = useState("");
    const [vectorTagFilters, setVectorTagFilters] = useState<string[]>([]);
    const [newVectorTagName, setNewVectorTagName] = useState("");
    const [editableVectorStorageName, setEditableVectorStorageName] = useState(
        MOCK_VECTOR_STORAGES[0]?.name ?? "",
    );
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isStorageFilesPickOpen, setIsStorageFilesPickOpen] = useState(false);
    const [pickedStorageFileIds, setPickedStorageFileIds] = useState<string[]>(
        [],
    );
    const [storageFilesSearchQuery, setStorageFilesSearchQuery] = useState("");

    const [isUploading] = useState(false);
    const [isPickingPath] = useState(false);
    const [isVectorStorageNameSaving] = useState(false);
    const [isVectorTagSaving] = useState(false);

    const [preparedVectorFiles, setPreparedVectorFiles] = useState<
        PreparedVectorFile[]
    >([
        {
            localId: "pf-1",
            name: "knowledge_base.pdf",
            source: "storage",
        },
        {
            localId: "pf-2",
            name: "contract_template.docx",
            source: "upload",
        },
    ]);

    const projectRefByFileId = useMemo(() => {
        return files.reduce<Record<string, ProjectRef | undefined>>(
            (acc, file) => {
                acc[file.id] = MOCK_PROJECTS.find(
                    (project) => project.id === file.projectId,
                );
                return acc;
            },
            {},
        );
    }, [files]);

    const selectedFile = useMemo(
        () => files.find((file) => file.id === selectedFileId),
        [files, selectedFileId],
    );

    const selectedFileProjectRef =
        selectedFile && selectedFile.id
            ? projectRefByFileId[selectedFile.id]
            : undefined;

    const selectedVectorStorage = useMemo(
        () =>
            vectorStorages.find(
                (vectorStorage) => vectorStorage.id === selectedVectorStorageId,
            ),
        [vectorStorages, selectedVectorStorageId],
    );

    const filteredFiles = useMemo(() => {
        const query = fileSearchQuery.trim().toLowerCase();
        if (!query) return files;

        return files.filter(
            (file) =>
                file.originalName.toLowerCase().includes(query) ||
                file.id.toLowerCase().includes(query) ||
                file.path.toLowerCase().includes(query),
        );
    }, [files, fileSearchQuery]);

    const filteredVectorStorages = useMemo(() => {
        const query = vectorSearchQuery.trim().toLowerCase();

        return vectorStorages.filter((vectorStorage) => {
            const matchesQuery =
                !query ||
                vectorStorage.name.toLowerCase().includes(query) ||
                vectorStorage.id.toLowerCase().includes(query);

            const matchesTags =
                vectorTagFilters.length === 0 ||
                vectorTagFilters.every((tagId) =>
                    vectorStorage.tags.includes(tagId),
                );

            return matchesQuery && matchesTags;
        });
    }, [vectorSearchQuery, vectorStorages, vectorTagFilters]);

    const containedFiles = useMemo(() => {
        if (!selectedVectorStorage) return [];
        return files.filter((file) => {
            const fileName = file.originalName.toLowerCase();
            if (selectedVectorStorage.tags.includes("contracts")) {
                return fileName.includes("contract");
            }
            if (selectedVectorStorage.tags.includes("faq")) {
                return fileName.includes("faq") || fileName.includes("base");
            }
            return true;
        });
    }, [selectedVectorStorage, files]);

    const preparedStorageFileIds = useMemo(() => {
        return preparedVectorFiles
            .filter((file) => file.source === "storage")
            .map((file) => {
                const found = files.find(
                    (stored) => stored.originalName === file.name,
                );
                return found?.id;
            })
            .filter((id): id is string => Boolean(id));
    }, [preparedVectorFiles, files]);

    const filteredStorageFilesForPick = useMemo(() => {
        const query = storageFilesSearchQuery.trim().toLowerCase();
        const supportedFiles = files.filter((file) => {
            const name = file.originalName.toLowerCase();
            return name.endsWith(".pdf") || name.endsWith(".docx");
        });

        if (!query) return supportedFiles;

        return supportedFiles.filter((file) =>
            file.originalName.toLowerCase().includes(query),
        );
    }, [files, storageFilesSearchQuery]);

    const vectorTagOptions = VECTOR_TAG_OPTIONS;

    const openSelectedFile = async () => {
        console.log("openSelectedFile fallback", { selectedFileId });
    };

    const openSelectedFileProject = () => {
        console.log("openSelectedFileProject fallback", {
            selectedFileId,
            projectRef: selectedFileProjectRef,
        });
    };

    const deleteSelectedFile = async () => {
        console.log("deleteSelectedFile fallback", { selectedFileId });
        if (!selectedFileId) return;
        setFiles((prev) => prev.filter((file) => file.id !== selectedFileId));
        setSelectedFileId("");
    };

    const runVectorization = async () => {
        console.log("runVectorization fallback", {
            selectedVectorStorageId,
            preparedVectorFiles,
        });
    };

    const addFilesFromExplorer = async () => {
        console.log("addFilesFromExplorer fallback");
        setPreparedVectorFiles((prev) => [
            ...prev,
            {
                localId: crypto.randomUUID(),
                name: `new_file_${prev.length + 1}.pdf`,
                source: "upload",
            },
        ]);
    };

    const createVectorStorage = async () => {
        console.log("createVectorStorage fallback");
        const next: VectorStorage = {
            id: `vec-${Date.now()}`,
            name: "Новое хранилище",
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            dataPath: "C:/data/vectors/new/index.faiss",
            size: 0,
            tags: [],
        };

        setVectorStorages((prev) => [next, ...prev]);
        setSelectedVectorStorageId(next.id);
        setEditableVectorStorageName(next.name);
    };

    const openDeleteConfirmModal = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteVectorStorage = async () => {
        console.log("confirmDeleteVectorStorage fallback", {
            selectedVectorStorageId,
        });
        setVectorStorages((prev) =>
            prev.filter(
                (vectorStorage) => vectorStorage.id !== selectedVectorStorageId,
            ),
        );
        setSelectedVectorStorageId("");
        setIsDeleteConfirmOpen(false);
    };

    const saveVectorStorageName = async () => {
        console.log("saveVectorStorageName fallback", {
            selectedVectorStorageId,
            editableVectorStorageName,
        });

        setVectorStorages((prev) =>
            prev.map((vectorStorage) =>
                vectorStorage.id === selectedVectorStorageId
                    ? { ...vectorStorage, name: editableVectorStorageName }
                    : vectorStorage,
            ),
        );
    };

    const createStorageTag = async () => {
        if (!newVectorTagName.trim() || !selectedVectorStorageId) return;

        console.log("createStorageTag fallback", {
            selectedVectorStorageId,
            newVectorTagName,
        });

        setVectorStorages((prev) =>
            prev.map((vectorStorage) => {
                if (vectorStorage.id !== selectedVectorStorageId) {
                    return vectorStorage;
                }

                const normalized = newVectorTagName.trim().toLowerCase();
                const hasTag = vectorStorage.tags.includes(normalized);

                return hasTag
                    ? vectorStorage
                    : {
                          ...vectorStorage,
                          tags: [...vectorStorage.tags, normalized],
                      };
            }),
        );

        setNewVectorTagName("");
    };

    const updateSelectedStorageTags = async (nextTagIds: string[]) => {
        console.log("updateSelectedStorageTags fallback", {
            selectedVectorStorageId,
            nextTagIds,
        });

        setVectorStorages((prev) =>
            prev.map((vectorStorage) =>
                vectorStorage.id === selectedVectorStorageId
                    ? { ...vectorStorage, tags: nextTagIds }
                    : vectorStorage,
            ),
        );
    };

    const removePreparedFile = (localId: string) => {
        console.log("removePreparedFile fallback", { localId });
        setPreparedVectorFiles((prev) =>
            prev.filter((file) => file.localId !== localId),
        );
    };

    const toggleStorageFileForPick = (fileId: string, checked: boolean) => {
        setPickedStorageFileIds((prev) => {
            if (checked) {
                return prev.includes(fileId) ? prev : [...prev, fileId];
            }

            return prev.filter((id) => id !== fileId);
        });
    };

    const confirmPickedStorageFiles = () => {
        console.log("confirmPickedStorageFiles fallback", {
            pickedStorageFileIds,
        });
        const pickedFiles = files.filter((file) =>
            pickedStorageFileIds.includes(file.id),
        );

        setPreparedVectorFiles((prev) => {
            const next = [...prev];
            pickedFiles.forEach((file) => {
                const alreadyExists = next.some(
                    (preparedFile) => preparedFile.name === file.originalName,
                );

                if (!alreadyExists) {
                    next.push({
                        localId: crypto.randomUUID(),
                        name: file.originalName,
                        source: "storage",
                    });
                }
            });
            return next;
        });

        setIsStorageFilesPickOpen(false);
    };

    return (
        <section className="animate-page-fade-in flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 p-4 backdrop-blur-md">
            <StorageViewSwitcher
                activeView={activeView}
                options={STORAGE_VIEW_OPTIONS}
                onChange={setActiveView}
            />

            {activeView === "files" ? (
                <StorageFilesView
                    fileSearchQuery={fileSearchQuery}
                    onFileSearchQueryChange={setFileSearchQuery}
                    filteredFiles={filteredFiles}
                    selectedFileId={selectedFileId}
                    onSelectFile={setSelectedFileId}
                    projectRefByFileId={projectRefByFileId}
                    selectedFile={selectedFile}
                    selectedFileProjectRef={selectedFileProjectRef}
                    onOpenSelectedFile={() => {
                        void openSelectedFile();
                    }}
                    onOpenSelectedFileProject={openSelectedFileProject}
                    onDeleteSelectedFile={() => {
                        void deleteSelectedFile();
                    }}
                />
            ) : (
                <StorageVectorsView
                    vectorSearchQuery={vectorSearchQuery}
                    onVectorSearchQueryChange={setVectorSearchQuery}
                    vectorTagOptions={vectorTagOptions}
                    vectorTagFilters={vectorTagFilters}
                    onVectorTagFiltersChange={setVectorTagFilters}
                    filteredVectorStorages={filteredVectorStorages}
                    selectedVectorStorageId={selectedVectorStorageId}
                    onSelectVectorStorage={(vectorStorageId, name) => {
                        setSelectedVectorStorageId(vectorStorageId);
                        setEditableVectorStorageName(name);
                    }}
                    formatDateTime={formatDateTime}
                    selectedVectorStorage={selectedVectorStorage}
                    onRunVectorization={() => {
                        void runVectorization();
                    }}
                    onAddFilesFromExplorer={() => {
                        void addFilesFromExplorer();
                    }}
                    isUploading={isUploading}
                    onOpenStorageFilesPick={() => {
                        setPickedStorageFileIds(preparedStorageFileIds);
                        setIsStorageFilesPickOpen(true);
                    }}
                    isPickingPath={isPickingPath}
                    onCreateVectorStorage={() => {
                        void createVectorStorage();
                    }}
                    onOpenDeleteConfirmModal={openDeleteConfirmModal}
                    editableVectorStorageName={editableVectorStorageName}
                    onEditableVectorStorageNameChange={
                        setEditableVectorStorageName
                    }
                    onSaveVectorStorageName={() => {
                        void saveVectorStorageName();
                    }}
                    isVectorStorageNameSaving={isVectorStorageNameSaving}
                    newVectorTagName={newVectorTagName}
                    onNewVectorTagNameChange={setNewVectorTagName}
                    onCreateStorageTag={() => {
                        void createStorageTag();
                    }}
                    isVectorTagSaving={isVectorTagSaving}
                    onUpdateSelectedStorageTags={(nextTagIds) => {
                        void updateSelectedStorageTags(nextTagIds);
                    }}
                    formatFileSize={formatFileSize}
                    preparedVectorFiles={preparedVectorFiles}
                    onRemovePreparedFile={removePreparedFile}
                    containedFiles={containedFiles}
                />
            )}

            <StorageModals
                isDeleteConfirmOpen={isDeleteConfirmOpen}
                onCloseDeleteConfirm={() => setIsDeleteConfirmOpen(false)}
                onConfirmDeleteVectorStorage={() => {
                    void confirmDeleteVectorStorage();
                }}
                selectedVectorStorage={selectedVectorStorage}
                isStorageFilesPickOpen={isStorageFilesPickOpen}
                onCloseStorageFilesPick={() => setIsStorageFilesPickOpen(false)}
                onConfirmPickedStorageFiles={confirmPickedStorageFiles}
                storageFilesSearchQuery={storageFilesSearchQuery}
                onStorageFilesSearchQueryChange={setStorageFilesSearchQuery}
                filteredStorageFilesForPick={filteredStorageFilesForPick}
                pickedStorageFileIds={pickedStorageFileIds}
                onToggleStorageFileForPick={toggleStorageFileForPick}
            />
        </section>
    );
}
