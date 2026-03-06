import { Button, InputCheckbox, InputSmall, Modal } from "@/components/atoms";
import type {
    StoredFile,
    VectorStorage,
} from "@/components/molecules/storage/types";

type StorageModalsProps = {
    isDeleteConfirmOpen: boolean;
    onCloseDeleteConfirm: () => void;
    onConfirmDeleteVectorStorage: () => void;
    selectedVectorStorage?: VectorStorage;
    isStorageFilesPickOpen: boolean;
    onCloseStorageFilesPick: () => void;
    onConfirmPickedStorageFiles: () => void;
    storageFilesSearchQuery: string;
    onStorageFilesSearchQueryChange: (value: string) => void;
    filteredStorageFilesForPick: StoredFile[];
    pickedStorageFileIds: string[];
    onToggleStorageFileForPick: (fileId: string, checked: boolean) => void;
};

export const StorageModals = ({
    isDeleteConfirmOpen,
    onCloseDeleteConfirm,
    onConfirmDeleteVectorStorage,
    selectedVectorStorage,
    isStorageFilesPickOpen,
    onCloseStorageFilesPick,
    onConfirmPickedStorageFiles,
    storageFilesSearchQuery,
    onStorageFilesSearchQueryChange,
    filteredStorageFilesForPick,
    pickedStorageFileIds,
    onToggleStorageFileForPick,
}: StorageModalsProps) => {
    return (
        <>
            <Modal
                open={isDeleteConfirmOpen}
                onClose={onCloseDeleteConfirm}
                title="Удаление векторного хранилища"
                className="max-w-md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={onCloseDeleteConfirm}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="danger"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={onConfirmDeleteVectorStorage}
                        >
                            Удалить
                        </Button>
                    </>
                }
            >
                <div className="space-y-2 text-sm text-main-300">
                    <p>Подтвердите удаление выбранного векторного хранилища.</p>
                    <p>
                        <span className="text-main-400">Название:</span>{" "}
                        {selectedVectorStorage?.name || "Не выбрано"}
                    </p>
                </div>
            </Modal>

            <Modal
                open={isStorageFilesPickOpen}
                onClose={onCloseStorageFilesPick}
                title="Выбор файлов из хранилища"
                className="min-h-[70vh] max-w-4xl"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={onCloseStorageFilesPick}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="primary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={onConfirmPickedStorageFiles}
                        >
                            Добавить выбранные
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-main-300">
                        Поддерживаются только типы PDF и DOCX
                    </p>
                    <InputSmall
                        value={storageFilesSearchQuery}
                        onChange={(event) =>
                            onStorageFilesSearchQueryChange(event.target.value)
                        }
                        placeholder="Фильтр по имени файла..."
                    />

                    <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
                        {filteredStorageFilesForPick.length > 0 ? (
                            filteredStorageFilesForPick.map((file) => {
                                const isPicked = pickedStorageFileIds.includes(
                                    file.id,
                                );

                                return (
                                    <div
                                        key={file.id}
                                        className="flex items-center gap-3 rounded-xl border border-main-700/70 bg-main-900/55 p-2"
                                    >
                                        <InputCheckbox
                                            checked={isPicked}
                                            onChange={(checked) =>
                                                onToggleStorageFileForPick(
                                                    file.id,
                                                    checked,
                                                )
                                            }
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm text-main-100">
                                                {file.originalName}
                                            </p>
                                            <p className="text-xs text-main-400">
                                                {file.id}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-dashed border-main-700/70 px-3 py-6 text-center text-sm text-main-400">
                                Не найдены подходящие PDF/DOCX файлы.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};
