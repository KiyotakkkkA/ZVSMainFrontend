"use client";

import {
    QueryClient,
    QueryClientProvider,
    type QueryClientConfig,
} from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";

const defaultConfig: QueryClientConfig = {
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
};

export const QueryProvider = ({ children }: PropsWithChildren) => {
    const [queryClient] = useState(() => new QueryClient(defaultConfig));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
