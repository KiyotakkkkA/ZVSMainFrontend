"use client";

import { useEffect, useRef, useState } from "react";
import { Button, InputCheckbox, InputSmall } from "@/components/atoms";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const loginMutation = useLogin();
    const handledVerifiedToastRef = useRef(false);

    useEffect(() => {
        if (searchParams.get("verified") !== "1") {
            return;
        }

        if (handledVerifiedToastRef.current) {
            return;
        }

        handledVerifiedToastRef.current = true;

        toast.success({
            title: "Код успешно подтвержден",
            description: "Теперь можно войти в аккаунт.",
        });

        router.replace("/auth/login");
    }, [router, searchParams, toast]);

    const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email || !password) {
            toast.warning({
                title: "Заполните поля",
                description: "Укажите email и пароль.",
            });
            return;
        }

        try {
            await loginMutation.mutateAsync({ email, password });
            toast.success({
                title: "Вход выполнен",
                description: "Переходим в панель.",
            });
            router.push("/panel");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Не удалось выполнить вход";

            toast.danger({
                title: "Ошибка входа",
                description: message,
            });
        }
    };

    return (
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
                <label htmlFor="email" className="text-xs text-main-300">
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
                <label htmlFor="password" className="text-xs text-main-300">
                    Пароль
                </label>
                <InputSmall
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
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
                    onClick={() => console.log("forgot password fallback")}
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
                disabled={loginMutation.isPending}
            >
                {loginMutation.isPending ? "Входим..." : "Войти"}
            </Button>
            <Link
                href="/auth/register"
                className="text-xs hover:underline text-main-300"
            >
                Впервые здесь?
            </Link>
        </form>
    );
}
