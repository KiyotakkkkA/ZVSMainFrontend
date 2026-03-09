"use client";
import { useMemo, useState } from "react";
import { StorageViewSwitcher } from "@/components/molecules/storage/StorageViewSwitcher";
import type {
    PreparedVectorFile,
    ProjectRef,
    StoredFile,
    StorageView,
} from "@/components/molecules/storage/types";
import { StorageFilesView } from "@/components/organisms/storage/StorageFilesView";
import { StorageModals } from "@/components/organisms/storage/StorageModals";
import { StorageVectorsView } from "@/components/organisms/storage/StorageVectorsView";
import {
    useDeleteVectorStorage,
    useRunVectorEmbeddings,
    useVectorStorageTags,
    useVectorStorages,
} from "@/hooks/useStorage";
import { useToast } from "@/hooks/useToast";
import { useUpload } from "@/hooks/useUpload";

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
    const toast = useToast();
    const [activeView, setActiveView] = useState<StorageView>("files");
    const [files, setFiles] = useState<StoredFile[]>(MOCK_FILES);

    const [selectedFileId, setSelectedFileId] = useState<string>(
        MOCK_FILES[0]?.id ?? "",
    );
    const [selectedVectorStorageId, setSelectedVectorStorageId] =
        useState<string>("");

    const [fileSearchQuery, setFileSearchQuery] = useState("");
    const [vectorSearchQuery, setVectorSearchQuery] = useState("");
    const [vectorTagFilters, setVectorTagFilters] = useState<string[]>([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isStorageFilesPickOpen, setIsStorageFilesPickOpen] = useState(false);
    const [pickedStorageFileIds, setPickedStorageFileIds] = useState<string[]>(
        [],
    );
    const [storageFilesSearchQuery, setStorageFilesSearchQuery] = useState("");

    const [isPickingPath] = useState(false);

    const { data: vectorStorages = [] } = useVectorStorages(
        {
            name: vectorSearchQuery,
            tagIds: vectorTagFilters,
        },
        {
            enabled: activeView === "vectors",
        },
    );

    const { data: vectorStorageTags = [] } = useVectorStorageTags({
        enabled: activeView === "vectors",
    });

    const vectorTagOptions = useMemo(
        () =>
            vectorStorageTags.map((tag) => ({
                value: tag.id,
                label: tag.name,
            })),
        [vectorStorageTags],
    );

    const deleteVectorStorageMutation = useDeleteVectorStorage({
        onSuccess: () => {
            setSelectedVectorStorageId("");
            setIsDeleteConfirmOpen(false);
            toast.success({ title: "Хранилище удалено" });
        },
        onError: (error) => {
            toast.danger({
                title: "Не удалось удалить хранилище",
                description: error.message,
            });
        },
    });

    const runVectorEmbeddingsMutation = useRunVectorEmbeddings({
        onSuccess: () => {
            toast.success({ title: "Индексация завершена" });
        },
        onError: (error) => {
            toast.danger({
                title: "Индексация завершилась с ошибкой",
                description: error.message,
            });
        },
    });

    const activeSelectedVectorStorageId =
        selectedVectorStorageId || vectorStorages[0]?.id || "";

    const [preparedVectorFiles, setPreparedVectorFiles] = useState<
        PreparedVectorFile[]
    >([]);

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

    const selectedVectorStorage = vectorStorages.find(
        (vectorStorage) => vectorStorage.id === activeSelectedVectorStorageId,
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

    const filteredVectorStorages = vectorStorages;

    const containedFiles = useMemo(() => {
        if (!selectedVectorStorage) return [];

        const tagNames = selectedVectorStorage.tags.map((tag) =>
            tag.name.toLowerCase(),
        );

        return files.filter((file) => {
            const fileName = file.originalName.toLowerCase();
            if (tagNames.includes("contracts")) {
                return fileName.includes("contract");
            }
            if (tagNames.includes("faq")) {
                return fileName.includes("faq") || fileName.includes("base");
            }
            return true;
        });
    }, [selectedVectorStorage, files]);

    const preparedStorageFileIds = useMemo(() => {
        return preparedVectorFiles
            .filter((file) => file.source === "storage")
            .map((file) => {
                return file.storageFileId;
            })
            .filter((id): id is string => Boolean(id));
    }, [preparedVectorFiles]);

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

    const openSelectedFile = async () => {
        console.log("openSelectedFile fallback", { selectedFileId });
    };

    const deleteSelectedFile = async () => {
        console.log("deleteSelectedFile fallback", { selectedFileId });
        if (!selectedFileId) return;
        setFiles((prev) => prev.filter((file) => file.id !== selectedFileId));
        setSelectedFileId("");
    };

    const runVectorization = async () => {
        if (!activeSelectedVectorStorageId) {
            toast.warning({ title: "Выберите векторное хранилище" });
            return;
        }

        runVectorEmbeddingsMutation.mutate({
            vstoreUuid: activeSelectedVectorStorageId,
            documents: preparedVectorFiles,
        });
    };

    const addFilesFromExplorer = async () => {
        openFileDialog();
    };

    const {
        inputRef,
        accept,
        multiple,
        isUploading,
        openFileDialog,
        handleInputChange,
    } = useUpload({
        onFilesSelected: (pickedFiles) => {
            setPreparedVectorFiles((prev) => {
                const next = [...prev];

                pickedFiles.forEach((file) => {
                    const alreadyExists = next.some(
                        (preparedFile) =>
                            preparedFile.source === "upload" &&
                            preparedFile.name === file.name,
                    );

                    if (!alreadyExists) {
                        next.push({
                            localId: crypto.randomUUID(),
                            name: file.name,
                            source: "upload",
                            file,
                        });
                    }
                });

                return next;
            });

            toast.success({
                title: "Файлы добавлены",
                description: `Добавлено: ${pickedFiles.length}`,
            });
        },
        onRejectedFiles: (rejectedFiles) => {
            toast.warning({
                title: "Некоторые файлы пропущены",
                description: `Поддерживаются только PDF и DOCX. Пропущено: ${rejectedFiles.length}`,
            });
        },
    });

    const openDeleteConfirmModal = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteVectorStorage = () => {
        if (!activeSelectedVectorStorageId) return;
        deleteVectorStorageMutation.mutate(activeSelectedVectorStorageId);
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
                        storageFileId: file.id,
                    });
                }
            });
            return next;
        });

        setIsStorageFilesPickOpen(false);
    };

    return (
        <section className="animate-page-fade-in flex min-w-0 flex-1 flex-col gap-3 rounded-3xl bg-main-900/70 p-4 backdrop-blur-md">
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleInputChange}
                className="hidden"
            />

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
                    selectedVectorStorageId={activeSelectedVectorStorageId}
                    onSelectVectorStorage={(vectorStorageId) => {
                        setSelectedVectorStorageId(vectorStorageId);
                    }}
                    formatDateTime={formatDateTime}
                    selectedVectorStorage={selectedVectorStorage}
                    onRunVectorization={() => {
                        void runVectorization();
                    }}
                    onAddFilesFromExplorer={() => {
                        void addFilesFromExplorer();
                    }}
                    isUploading={
                        isUploading || runVectorEmbeddingsMutation.isPending
                    }
                    onOpenStorageFilesPick={() => {
                        setPickedStorageFileIds(preparedStorageFileIds);
                        setIsStorageFilesPickOpen(true);
                    }}
                    isPickingPath={isPickingPath}
                    onOpenDeleteConfirmModal={openDeleteConfirmModal}
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
