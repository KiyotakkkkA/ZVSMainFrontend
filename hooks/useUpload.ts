"use client";

import { useRef, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";

type UseUploadOptions = {
    onFilesSelected: (files: File[]) => void | Promise<void>;
    onRejectedFiles?: (files: File[]) => void;
    allowedExtensions?: string[];
    multiple?: boolean;
};

const defaultExtensions = [".pdf", ".docx"];

export const useUpload = ({
    onFilesSelected,
    onRejectedFiles,
    allowedExtensions = defaultExtensions,
    multiple = true,
}: UseUploadOptions) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const uploadMutation = useMutation<void, Error, File[]>({
        mutationFn: async (files) => {
            await onFilesSelected(files);
        },
    });

    const accept = allowedExtensions.join(",");

    const openFileDialog = () => {
        inputRef.current?.click();
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const pickedFiles = Array.from(event.target.files ?? []);

        if (pickedFiles.length === 0) {
            return;
        }

        const allowed = new Set(
            allowedExtensions.map((extension) => extension.toLowerCase()),
        );

        const acceptedFiles: File[] = [];
        const rejectedFiles: File[] = [];

        pickedFiles.forEach((file) => {
            const dotIndex = file.name.lastIndexOf(".");
            const extension =
                dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";

            if (allowed.has(extension)) {
                acceptedFiles.push(file);
            } else {
                rejectedFiles.push(file);
            }
        });

        if (rejectedFiles.length > 0) {
            onRejectedFiles?.(rejectedFiles);
        }

        if (acceptedFiles.length > 0) {
            uploadMutation.mutate(acceptedFiles);
        }

        event.target.value = "";
    };

    return {
        inputRef,
        accept,
        multiple,
        isUploading: uploadMutation.isPending,
        openFileDialog,
        handleInputChange,
    };
};
