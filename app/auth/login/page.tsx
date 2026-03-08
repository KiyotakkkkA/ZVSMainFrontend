"use client";

import Image from "next/image";
import { useState } from "react";
import Logo from "@/public/images/logo.svg";
import { Button, Card, InputCheckbox, InputSmall } from "@/components/atoms";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);

    const handleLogin = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("login submit fallback", {
            email,
            hasPassword: password.length > 0,
            rememberMe,
        });
    };

    return (
        <>
            <Card className="relative overflow-hidden rounded-3xl bg-main-900/70 p-6 backdrop-blur-md lg:p-8 border-transparent">
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
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-main-400">
                            Авторизация
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-main-100">
                            Добро пожаловать!
                        </h2>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-xs text-main-300"
                        >
                            Email
                        </label>
                        <InputSmall
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@company.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-xs text-main-300"
                        >
                            Пароль
                        </label>
                        <InputSmall
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Введите пароль"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-xlpx-3 py-2">
                        <label className="flex items-center gap-2 text-xs text-main-300">
                            <InputCheckbox
                                checked={rememberMe}
                                onChange={setRememberMe}
                            />
                            Запомнить меня
                        </label>
                        <button
                            type="button"
                            onClick={() =>
                                console.log("forgot password fallback")
                            }
                            className="text-xs text-cyan-300 transition-colors hover:text-cyan-200"
                        >
                            Забыли пароль?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        shape="rounded-lg"
                        className="h-11 w-full text-sm"
                    >
                        Войти
                    </Button>
                    <Link
                        href="/auth/register"
                        className="text-xs hover:underline text-main-300"
                    >
                        Впервые здесь?
                    </Link>
                </form>
            </Card>
        </>
    );
}
