"use client";

import { useState } from "react";
import { Button, InputCheckbox, InputSmall } from "@/components/atoms";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegister } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const registerMutation = useRegister();

    const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email || !password || !passwordConfirm) {
            toast.warning({
                title: "Заполните поля",
                description: "Email, пароль и подтверждение обязательны.",
            });
            return;
        }

        if (password !== passwordConfirm) {
            toast.warning({
                title: "Пароли не совпадают",
                description: "Проверьте введённые данные.",
            });
            return;
        }

        if (!termsAccepted) {
            toast.warning({
                title: "Подтвердите согласие",
                description: "Нужно принять правила пользования сервисом.",
            });
            return;
        }

        try {
            const result = await registerMutation.mutateAsync({
                email,
                password,
                passwordConfirm,
            });
            router.push(
                `/auth/verify?${new URLSearchParams({ email }).toString()}&${new URLSearchParams({ token: result.verificationToken }).toString()}`,
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Не удалось завершить регистрацию";

            toast.danger({
                title: "Ошибка регистрации",
                description: message,
            });
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <p className="text-xs uppercase tracking-[0.16em] text-main-400">
                    Регистрация
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
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="passwordConfirm"
                    className="text-xs text-main-300"
                >
                    Подтверждение пароля
                </label>
                <InputSmall
                    type="password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    placeholder="Подтвердите пароль"
                />
            </div>

            <div className="flex items-center justify-between rounded-xlpx-3 py-2">
                <label className="flex items-center gap-2 text-xs text-main-300">
                    <InputCheckbox
                        checked={termsAccepted}
                        onChange={setTermsAccepted}
                    />
                    Соглашаюсь с правилами пользования сервисом
                </label>
            </div>

            <Button
                type="submit"
                variant="primary"
                shape="rounded-lg"
                className="h-11 w-full text-sm"
                disabled={registerMutation.isPending}
            >
                {registerMutation.isPending
                    ? "Регистрируем..."
                    : "Зарегистрироватся"}
            </Button>
            <Link
                href="/auth/login"
                className="text-xs hover:underline text-main-300"
            >
                Уже есть аккаунт?
            </Link>
        </form>
    );
}
