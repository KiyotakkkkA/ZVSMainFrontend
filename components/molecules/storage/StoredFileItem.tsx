import type { StoredFile } from "@/components/molecules/storage/types";

type StoredFileItemProps = {
    file: StoredFile;
    selected: boolean;
    projectTitle?: string;
    onClick: () => void;
};

export const StoredFileItem = ({
    file,
    selected,
    projectTitle,
    onClick,
}: StoredFileItemProps) => {
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
            <p className="truncate text-sm font-medium text-main-100">
                {file.originalName}
            </p>
            <p className="mt-1 truncate text-xs text-main-400">
                {projectTitle || "Без проекта"}
            </p>
        </button>
    );
};
