import Image from "next/image";
import { Card } from "@/components/atoms";
import Logo from "@/public/images/logo.svg";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-main-900 px-4 py-8">
            <section className="relative z-10 w-full max-w-5xl">
                <div className="grid items-stretch gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="relative overflow-hidden rounded-3xl border-transparent bg-main-900/70 p-6 backdrop-blur-md lg:p-8">
                        <div className="relative">
                            <div className="mb-8 flex items-center gap-3">
                                <Image
                                    src={Logo}
                                    alt="ZVS logo"
                                    width={34}
                                    height={34}
                                />
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-main-400">
                                        Zesty. Valuable. Smart.
                                    </p>
                                    <h1 className="text-xl font-semibold text-main-100">
                                        Рабочее пространство
                                    </h1>
                                </div>
                            </div>

                            <p className="max-w-lg text-sm leading-6 text-main-300">
                                Тут что то будет.
                            </p>
                        </div>
                    </Card>

                    <Card className="rounded-3xl border border-main-700/80 bg-main-900/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-6">
                        {children}
                    </Card>
                </div>
            </section>
        </main>
    );
}
