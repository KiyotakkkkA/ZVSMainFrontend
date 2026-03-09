import { Button, InputSmall } from "@/components/atoms";
import { StoredFileItem } from "@/components/molecules/storage/StoredFileItem";
import type {
    ProjectRef,
    StoredFile,
} from "@/components/molecules/storage/types";

type StorageFilesViewProps = {
    fileSearchQuery: string;
    onFileSearchQueryChange: (value: string) => void;
    filteredFiles: StoredFile[];
    selectedFileId: string;
    onSelectFile: (fileId: string) => void;
    projectRefByFileId: Record<string, ProjectRef | undefined>;
    selectedFile?: StoredFile;
    selectedFileProjectRef?: ProjectRef;
    onOpenSelectedFile: () => void;
    onDeleteSelectedFile: () => void;
};

export const StorageFilesView = ({
    fileSearchQuery,
    onFileSearchQueryChange,
    filteredFiles,
    selectedFileId,
    onSelectFile,
    projectRefByFileId,
    selectedFile,
    selectedFileProjectRef,
    onOpenSelectedFile,
    onDeleteSelectedFile,
}: StorageFilesViewProps) => {
    return (
        <div className="min-h-0 flex-1 rounded-2xl bg-main-900/60">
            <div className="grid h-full min-h-0 grid-cols-[360px_1fr] gap-3">
                <div className="flex min-h-0 flex-col gap-3 border-r border-main-700/70 pr-3">
                    <InputSmall
                        value={fileSearchQuery}
                        onChange={(event) =>
                            onFileSearchQueryChange(event.target.value)
                        }
                        placeholder="Найти файл..."
                    />

                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <StoredFileItem
                                    key={file.id}
                                    file={file}
                                    selected={file.id === selectedFileId}
                                    projectTitle={
                                        projectRefByFileId[file.id]?.title
                                    }
                                    onClick={() => onSelectFile(file.id)}
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-main-700/70 bg-main-900/40 px-3 py-6 text-center text-sm text-main-400">
                                Не найдено файлов, соответствующих запросу.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex min-h-0 flex-col rounded-xl bg-main-900/40 p-4">
                    {selectedFile ? (
                        <>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-base font-semibold text-main-100">
                                        {selectedFile.originalName}
                                    </p>
                                    <p className="mt-1 text-xs text-main-400">
                                        ID: {selectedFile.id}
                                    </p>
                                </div>

                                <div className="space-x-4">
                                    <Button
                                        variant="primary"
                                        shape="rounded-lg"
                                        className="h-8 px-3 text-xs"
                                        onClick={onOpenSelectedFile}
                                    >
                                        <span>Открыть файл</span>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        shape="rounded-lg"
                                        className="h-8 px-3 text-xs"
                                        onClick={onDeleteSelectedFile}
                                    >
                                        <span>Удалить файл</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm">
                                <div className="rounded-lg border border-main-700/70 bg-main-900/60 px-3 py-2">
                                    <p className="text-xs text-main-400">
                                        Путь
                                    </p>
                                    <p className="truncate text-main-200">
                                        {selectedFile.path}
                                    </p>
                                </div>

                                <div className="rounded-lg border border-main-700/70 bg-main-900/60 px-3 py-2">
                                    <p className="text-xs text-main-400">
                                        Проект
                                    </p>
                                    <p className="text-main-200">
                                        {selectedFileProjectRef?.title ||
                                            "Без привязки к проекту"}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-main-400">
                            Выберите файл для просмотра деталей.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
