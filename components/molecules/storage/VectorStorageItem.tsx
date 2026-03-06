import type { VectorStorage } from "@/components/molecules/storage/types";

type VectorStorageItemProps = {
    vectorStorage: VectorStorage;
    selected: boolean;
    formatDateTime: (value: string) => string;
    onClick: () => void;
};

export const VectorStorageItem = ({
    vectorStorage,
    selected,
    formatDateTime,
    onClick,
}: VectorStorageItemProps) => {
    return (
        <button
            type="button"
            className={`w-full cursor-pointer rounded-xl px-3 py-3 text-left transition-colors ${
                selected
                    ? "bg-main-800/80"
                    : "bg-main-900/55 hover:bg-main-800/70"
            }`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-main-100">
                    {vectorStorage.name}
                </p>
                <p className="text-xs text-main-400">
                    {formatDateTime(vectorStorage.createdAt)}
                </p>
            </div>
            <p className="mt-1 truncate text-xs text-main-400">
                id: {vectorStorage.id}
            </p>
        </button>
    );
};
