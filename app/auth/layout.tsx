export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-main-900 px-4 py-8">
            <section className="relative z-10 w-full max-w-5xl">
                <div className="grid items-stretch gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    {children}
                </div>
            </section>
        </main>
    );
}
