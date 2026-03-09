import { Switcher } from "@/components/atoms";
import type { StorageView } from "@/components/molecules/storage/types";

type StorageViewSwitcherProps = {
    activeView: StorageView;
    options: Array<{ value: string; label: string }>;
    onChange: (nextValue: StorageView) => void;
};

export const StorageViewSwitcher = ({
    activeView,
    options,
    onChange,
}: StorageViewSwitcherProps) => {
    return (
        <div className="rounded-2xl bg-main-900/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-main-100">
                    Хранилище
                </h2>
            </div>

            <div className="mt-4">
                <Switcher
                    value={activeView}
                    options={options}
                    onChange={(nextValue) => onChange(nextValue as StorageView)}
                />
            </div>
        </div>
    );
};
