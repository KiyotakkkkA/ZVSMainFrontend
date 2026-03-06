import {
    AutoFillSelector,
    Button,
    InputSmall,
    PrettyBR,
} from "@/components/atoms";
import { PreparedVectorFileItem } from "@/components/molecules/storage/PreparedVectorFileItem";
import { VectorStorageItem } from "@/components/molecules/storage/VectorStorageItem";
import type {
    PreparedVectorFile,
    StoredFile,
    VectorStorage,
} from "@/components/molecules/storage/types";

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
    onCreateVectorStorage: () => void;
    onOpenDeleteConfirmModal: () => void;
    editableVectorStorageName: string;
    onEditableVectorStorageNameChange: (value: string) => void;
    onSaveVectorStorageName: () => void;
    isVectorStorageNameSaving: boolean;
    newVectorTagName: string;
    onNewVectorTagNameChange: (value: string) => void;
    onCreateStorageTag: () => void;
    isVectorTagSaving: boolean;
    onUpdateSelectedStorageTags: (nextTagIds: string[]) => void;
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
    onCreateVectorStorage,
    onOpenDeleteConfirmModal,
    editableVectorStorageName,
    onEditableVectorStorageNameChange,
    onSaveVectorStorageName,
    isVectorStorageNameSaving,
    newVectorTagName,
    onNewVectorTagNameChange,
    onCreateStorageTag,
    isVectorTagSaving,
    onUpdateSelectedStorageTags,
    formatFileSize,
    preparedVectorFiles,
    onRemovePreparedFile,
    containedFiles,
}: StorageVectorsViewProps) => {
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
                                    onClick={() =>
                                        onSelectVectorStorage(
                                            vectorStorage.id,
                                            vectorStorage.name,
                                        )
                                    }
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
                                className="h-8 px-3 text-xs"
                                onClick={onRunVectorization}
                            >
                                <span className="text-main-900">Индекс</span>
                            </Button>
                            <Button
                                variant="secondary"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs"
                                onClick={onAddFilesFromExplorer}
                                disabled={isUploading}
                            >
                                <span>Добавить файл</span>
                            </Button>
                            <Button
                                variant="secondary"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs"
                                onClick={onOpenStorageFilesPick}
                            >
                                <span>Из хранилища</span>
                            </Button>
                            <Button
                                variant="primary"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs"
                                onClick={onCreateVectorStorage}
                            >
                                <span>Создать новое</span>
                            </Button>
                            <Button
                                variant="danger"
                                shape="rounded-full"
                                className="h-8 px-3 text-xs"
                                onClick={onOpenDeleteConfirmModal}
                            >
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
                                        value={editableVectorStorageName}
                                        onChange={(event) =>
                                            onEditableVectorStorageNameChange(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Введите название"
                                    />
                                    <Button
                                        variant="primary"
                                        shape="rounded-lg"
                                        className="h-9 shrink-0 px-3 text-xs"
                                        onClick={onSaveVectorStorageName}
                                        disabled={isVectorStorageNameSaving}
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
                                            onNewVectorTagNameChange(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Новый тег"
                                    />
                                    <Button
                                        variant="secondary"
                                        shape="rounded-lg"
                                        className="h-9 shrink-0 px-3 text-xs"
                                        onClick={onCreateStorageTag}
                                        disabled={isVectorTagSaving}
                                    >
                                        Добавить тег
                                    </Button>
                                </div>
                                <AutoFillSelector
                                    className="mt-3"
                                    options={vectorTagOptions}
                                    value={selectedVectorStorage.tags}
                                    onChange={onUpdateSelectedStorageTags}
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
                                <p className="text-main-400">Файл индекса</p>
                                <p className="break-all text-main-200">
                                    {selectedVectorStorage.dataPath ||
                                        "Не указана"}
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

                            <div className="mt-4 rounded-xl border border-main-700/70 bg-main-900/45 p-3">
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
                                            векторизации.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-main-700/70 bg-main-900/45 p-3">
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
