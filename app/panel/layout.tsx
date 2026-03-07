import { DashboardNavPanel } from "@/components/layout/DashboardNavPanel";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex gap-4 p-3">
            <DashboardNavPanel />
            {children}
        </div>
    );
}
