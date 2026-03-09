import { DashboardNavPanel } from "@/components/layout/DashboardNavPanel";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen gap-4 p-3">
            <DashboardNavPanel />
            <main className="min-h-[calc(100vh-1.5rem)] flex-1">
                {children}
            </main>
        </div>
    );
}
