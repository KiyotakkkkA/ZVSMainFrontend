"use client";

import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { Toast, type ToastItem } from "@/components/atoms/Toast";
import {
    ToastContext,
    type ToastContextValue,
    type ToastInput,
    type ToastType,
} from "./ToastContext";

const DEFAULT_DURATION = 3500;

export const ToastProvider = ({ children }: PropsWithChildren) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback((type: ToastType, input: ToastInput) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        setToasts((prev) => [
            ...prev,
            {
                id,
                type,
                title: input.title,
                description: input.description,
                durationMs: input.durationMs ?? DEFAULT_DURATION,
            },
        ]);
    }, []);

    const contextValue = useMemo<ToastContextValue>(
        () => ({
            push,
            normal: (input) => push("normal", input),
            info: (input) => push("info", input),
            warning: (input) => push("warning", input),
            success: (input) => push("success", input),
            danger: (input) => push("danger", input),
        }),
        [push],
    );

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            <div className="pointer-events-none fixed right-4 bottom-4 z-70 flex w-90 max-w-[calc(100vw-2rem)] flex-col gap-2">
                {toasts.map((item) => (
                    <Toast key={item.id} item={item} onDone={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
