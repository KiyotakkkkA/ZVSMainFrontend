import {
    AutoFillSelector,
    Button,
    InputSmall,
    Loader,
    PrettyBR,
} from "@/components/atoms";
import {
    useCreateVectorStorage,
    useCreateVectorStorageTags,
    useUpdateVectorStorage,
} from "@/hooks/useStorage";
import { useToast } from "@/hooks/useToast";
import { PreparedVectorFileItem } from "@/components/molecules/storage/PreparedVectorFileItem";
import { VectorStorageItem } from "@/components/molecules/storage/VectorStorageItem";
import type {
    PreparedVectorFile,
    StoredFile,
    VectorStorage,
} from "@/components/molecules/storage/types";
import { Icon } from "@iconify/react";
import { useState } from "react";

type StorageVectorsViewProps = {
    vectorSearchQuery: string;
    onVectorSearchQueryChange: (value: string) => void;
    vectorTagOptions: Array<{ value: string; label: string }>;
    vectorTagFilters: string[];
    onVectorTagFiltersChange: (value: string[]) => void;
    filteredVectorStorages: VectorStorage[];
    selectedVectorStorageId: string;
    onSelectVectorStorage: (vectorStorageId: string, name: string) => void;
    formatDateTime: (value: string) => string;
    selectedVectorStorage?: VectorStorage;
    onRunVectorization: () => void;
    onAddFilesFromExplorer: () => void;
    isUploading: boolean;
    onOpenStorageFilesPick: () => void;
    isPickingPath: boolean;
    onOpenDeleteConfirmModal: () => void;
    formatFileSize: (size: number) => string;
    preparedVectorFiles: PreparedVectorFile[];
    onRemovePreparedFile: (localId: string) => void;
    containedFiles: StoredFile[];
};

export const StorageVectorsView = ({
    vectorSearchQuery,
    onVectorSearchQueryChange,
    vectorTagOptions,
    vectorTagFilters,
    onVectorTagFiltersChange,
    filteredVectorStorages,
    selectedVectorStorageId,
    onSelectVectorStorage,
    formatDateTime,
    selectedVectorStorage,
    onRunVectorization,
    onAddFilesFromExplorer,
    isUploading,
    onOpenStorageFilesPick,
    onOpenDeleteConfirmModal,
    formatFileSize,
    preparedVectorFiles,
    onRemovePreparedFile,
    containedFiles,
}: StorageVectorsViewProps) => {
    const toast = useToast();
    const [editableVectorStorageName, setEditableVectorStorageName] =
        useState("");
    const [newVectorTagName, setNewVectorTagName] = useState("");
    const [draftTagsStorageId, setDraftTagsStorageId] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    const toTagIds = (tags: Array<{ id: string; name: string } | string>) =>
        Array.from(
            new Set(
                tags
                    .map((tag) =>
                        typeof tag === "string" ? tag : (tag?.id ?? ""),
                    )
                    .filter((tagId) => Boolean(tagId)),
            ),
        );

    const storageTagIds = toTagIds(selectedVectorStorage?.tags ?? []);

    const effectiveSelectedTagIds =
        draftTagsStorageId === selectedVectorStorageId
            ? selectedTagIds
            : storageTagIds;

    const createVectorStorageMutation = useCreateVectorStorage({
        onSuccess: (created) => {
            toast.success({ title: "Хранилище создано" });
            onSelectVectorStorage(created.id, created.name);
            setEditableVectorStorageName(created.name);
            setDraftTagsStorageId(created.id);
            setSelectedTagIds(toTagIds(created.tags ?? []));
        },
        onError: (error) => {
            toast.danger({
                title: "Не удалось создать хранилище",
                description: error.message,
            });
        },
    });

    const updateVectorStorageMutation = useUpdateVectorStorage({
        onSuccess: (updated) => {
            toast.success({ title: "Хранилище обновлено" });
            onSelectVectorStorage(updated.id, updated.name);
            setEditableVectorStorageName(updated.name);
        },
        onError: (error) => {
            toast.danger({
                title: "Ошибка обновления",
                description: error.message,
            });
        },
    });

    const updateVectorStorageData = ({
        name,
        tagIds,
    }: {
        name?: string;
        tagIds?: string[];
    }) => {
        if (!selectedVectorStorageId) return;

        const nextName =
            (name ?? editableVectorStorageName.trim()) ||
            selectedVectorStorage?.name;

        if (!nextName) {
            toast.warning({ title: "Укажите название хранилища" });
            return;
        }

        const nextTagIds = Array.from(
            new Set((tagIds ?? effectiveSelectedTagIds).filter(Boolean)),
        );

        setDraftTagsStorageId(selectedVectorStorageId);
        setSelectedTagIds(nextTagIds);

        updateVectorStorageMutation.mutate({
            id: selectedVectorStorageId,
            name: nextName,
            tagIds: nextTagIds,
        });
    };

    const createVectorStorageTagsMutation = useCreateVectorStorageTags({
        onSuccess: (createdTag) => {
            if (!selectedVectorStorageId) {
                setNewVectorTagName("");
                return;
            }

            const currentTagIds = effectiveSelectedTagIds;
            const nextTagIds = Array.from(
                new Set([...currentTagIds, createdTag.id]),
            );
            const nextName =
                editableVectorStorageName.trim() ||
                selectedVectorStorage?.name ||
                "";

            if (!nextName) {
                setNewVectorTagName("");
                return;
            }

            updateVectorStorageData({
                name: nextName,
                tagIds: nextTagIds,
            });

            setNewVectorTagName("");
            toast.success({ title: "Тег создан и назначен" });
        },
        onError: (error) => {
            toast.danger({
                title: "Не удалось создать тег",
                description: error.message,
            });
        },
    });

    const saveVectorStorageName = () => {
        if (!selectedVectorStorageId) return;

        const nextName =
            editableVectorStorageName.trim() || selectedVectorStorage?.name;

        updateVectorStorageData({
            name: nextName,
        });
    };

    const createStorageTag = () => {
        if (!newVectorTagName.trim()) {
            toast.warning({ title: "Введите название тега" });
            return;
        }

        createVectorStorageTagsMutation.mutate({
            name: newVectorTagName.trim(),
        });
    };

    const updateSelectedStorageTags = (nextTagIds: string[]) => {
        if (!selectedVectorStorageId) return;

        updateVectorStorageData({
            tagIds: nextTagIds,
        });
    };

    const createVectorStorage = () => {
        createVectorStorageMutation.mutate({ name: "Новое хранилище" });
    };

    return (
        <div className="min-h-0 flex-1 rounded-2xl bg-main-900/60">
            <div className="grid h-full min-h-0 grid-cols-[360px_1fr] gap-3">
                <aside className="flex min-h-0 flex-col gap-3 border-r border-main-700/70 pr-3">
                    <InputSmall
                        value={vectorSearchQuery}
                        onChange={(event) =>
                            onVectorSearchQueryChange(event.target.value)
                        }
                        placeholder="Поиск векторного хранилища..."
                    />
                    <AutoFillSelector
                        options={vectorTagOptions}
                        value={vectorTagFilters}
                        onChange={onVectorTagFiltersChange}
                        placeholder="Фильтр по тегам"
                    />

                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {filteredVectorStorages.length > 0 ? (
                            filteredVectorStorages.map((vectorStorage) => (
                                <VectorStorageItem
                                    key={vectorStorage.id}
                                    vectorStorage={vectorStorage}
                                    selected={
                                        vectorStorage.id ===
                                        selectedVectorStorageId
                                    }
                                    formatDateTime={formatDateTime}
                                    onClick={() => {
                                        setEditableVectorStorageName(
                                            vectorStorage.name,
                                        );
                                        setDraftTagsStorageId(vectorStorage.id);
                                        setSelectedTagIds(
                                            toTagIds(vectorStorage.tags ?? []),
                                        );
                                        onSelectVectorStorage(
                                            vectorStorage.id,
                                            vectorStorage.name,
                                        );
                                    }}
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-main-700/70 bg-main-900/40 px-3 py-6 text-center text-sm text-main-400">
                                Векторные хранилища не найдены.
                            </div>
                        )}
                    </div>
                </aside>

                <section className="min-h-0 overflow-y-auto rounded-xl bg-main-900/40 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-main-400">
                                Векторное хранилище
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-main-100">
                                {selectedVectorStorage?.name || "Без названия"}
                            </h3>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                                variant="success"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs gap-2"
                                onClick={onRunVectorization}
                            >
                                {isUploading ? (
                                    <Loader className="bg-main-900" />
                                ) : (
                                    <Icon
                                        icon="mdi:play"
                                        width={18}
                                        className="text-main-900"
                                    />
                                )}
                                <span className="text-main-900">Индекс</span>
                            </Button>
                            <Button
                                variant="secondary"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs gap-2"
                                onClick={onAddFilesFromExplorer}
                                disabled={isUploading}
                            >
                                <Icon icon="mdi:upload" width={18} />
                                <span>Добавить файл</span>
                            </Button>
                            <Button
                                variant="secondary"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs gap-2"
                                disabled
                                onClick={onOpenStorageFilesPick}
                            >
                                <Icon icon="mdi:storage" width={18} />
                                <span>Из хранилища</span>
                            </Button>
                            <Button
                                variant="primary"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs gap-2"
                                onClick={createVectorStorage}
                                disabled={createVectorStorageMutation.isPending}
                            >
                                <Icon icon="mdi:plus" width={18} />
                                <span>Создать новое</span>
                            </Button>
                            <Button
                                variant="danger"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs gap-2"
                                onClick={onOpenDeleteConfirmModal}
                            >
                                <Icon icon="mdi:trash-can-outline" width={18} />
                                <span>Удалить</span>
                            </Button>
                        </div>
                    </div>

                    {selectedVectorStorage ? (
                        <>
                            <div className="rounded-xl bg-main-900/45">
                                <p className="text-xs text-main-400">
                                    Название хранилища
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <InputSmall
                                        value={
                                            editableVectorStorageName ||
                                            selectedVectorStorage.name
                                        }
                                        onChange={(event) =>
                                            setEditableVectorStorageName(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Введите название"
                                    />
                                    <Button
                                        variant="primary"
                                        shape="rounded-lg"
                                        className="h-9 shrink-0 px-3 text-xs"
                                        onClick={saveVectorStorageName}
                                        disabled={
                                            updateVectorStorageMutation.isPending
                                        }
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            </div>

                            <PrettyBR label="Теги" icon="mdi:tag" />

                            <div className="mt-4 rounded-xl bg-main-900/45">
                                <div className="mt-3 flex items-center gap-2">
                                    <InputSmall
                                        value={newVectorTagName}
                                        onChange={(event) =>
                                            setNewVectorTagName(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Новый тег"
                                    />
                                    <Button
                                        variant="secondary"
                                        shape="rounded-lg"
                                        className="h-9 shrink-0 px-3 text-xs"
                                        onClick={createStorageTag}
                                        disabled={
                                            createVectorStorageTagsMutation.isPending
                                        }
                                    >
                                        Добавить тег
                                    </Button>
                                </div>
                                <AutoFillSelector
                                    className="mt-3"
                                    options={vectorTagOptions}
                                    value={effectiveSelectedTagIds}
                                    onChange={updateSelectedStorageTags}
                                    placeholder="Назначьте теги хранилищу"
                                />
                            </div>

                            <PrettyBR
                                label="Детали хранилища"
                                icon="mdi:information-outline"
                            />

                            <div className="grid grid-cols-[180px_1fr] gap-y-2 text-sm">
                                <p className="text-main-400">ID</p>
                                <p className="text-main-200">
                                    {selectedVectorStorage.id}
                                </p>
                                <p className="text-main-400">Размер</p>
                                <p className="text-main-200">
                                    {formatFileSize(selectedVectorStorage.size)}
                                </p>
                                <p className="text-main-400">
                                    Последняя активность
                                </p>
                                <p className="text-main-200">
                                    {formatDateTime(
                                        selectedVectorStorage.lastActiveAt,
                                    )}
                                </p>
                                <p className="text-main-400">Создано</p>
                                <p className="text-main-200">
                                    {formatDateTime(
                                        selectedVectorStorage.createdAt,
                                    )}
                                </p>
                            </div>

                            <PrettyBR
                                label="Содержимое хранилища"
                                icon="mdi:database"
                            />

                            <div className="mt-4 rounded-xl bg-main-900/45">
                                <h4 className="text-sm font-semibold text-main-100">
                                    Подготовленные файлы
                                </h4>
                                <div className="mt-3 space-y-2">
                                    {preparedVectorFiles.length > 0 ? (
                                        preparedVectorFiles.map((file) => (
                                            <PreparedVectorFileItem
                                                key={file.localId}
                                                file={file}
                                                onRemove={onRemovePreparedFile}
                                            />
                                        ))
                                    ) : (
                                        <div className="flex h-20 items-center justify-center text-xs text-main-400">
                                            Добавьте PDF/DOCX файлы для
                                            индексации.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-main-900/45">
                                <h4 className="text-sm font-semibold text-main-100">
                                    Содержащиеся файлы
                                </h4>
                                <div className="mt-3 space-y-2">
                                    {containedFiles.length > 0 ? (
                                        containedFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                className="rounded-lg border border-main-700/70 bg-main-900/55 px-3 py-2"
                                            >
                                                <p className="truncate text-sm text-main-200">
                                                    {file.originalName}
                                                </p>
                                                <p className="text-xs text-main-400">
                                                    {file.id}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex h-16 items-center justify-center text-xs text-main-400">
                                            В хранилище пока нет файлов.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-main-400">
                            Выберите векторное хранилище для просмотра.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
