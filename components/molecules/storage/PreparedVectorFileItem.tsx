import { Button } from "@/components/atoms";
import type { PreparedVectorFile } from "@/components/molecules/storage/types";

type PreparedVectorFileItemProps = {
    file: PreparedVectorFile;
    onRemove: (localId: string) => void;
};

export const PreparedVectorFileItem = ({
    file,
    onRemove,
}: PreparedVectorFileItemProps) => {
    return (
        <div className="rounded-lg border border-main-700/70 bg-main-900/55 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-sm text-main-200">
                        {file.name}
                    </p>
                    <p className="text-xs text-main-400">
                        {file.source === "upload"
                            ? "Источник: Проводник"
                            : "Источник: Хранилище"}
                    </p>
                </div>
                <Button
                    variant="secondary"
                    shape="rounded-lg"
                    className="h-7 w-7"
                    onClick={() => onRemove(file.localId)}
                >
                    x
                </Button>
            </div>
        </div>
    );
};
