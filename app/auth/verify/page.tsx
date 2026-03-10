"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button, InputSmall } from "@/components/atoms";
import { useToast } from "@/hooks/useToast";
import { useCodeSend, useCodeVerify } from "@/hooks/useAuth";
import { Icon } from "@iconify/react";

const CODE_LENGTH = 6;
const RESEND_TIMEOUT = 60;
const RESEND_TIMER_KEY = "zvs.verificationCodeResendTimer";

const getResendRemainingSeconds = (startedAt: string) => {
    const startedAtMs = new Date(startedAt).getTime();

    if (Number.isNaN(startedAtMs)) {
        return 0;
    }

    const expiresAt = startedAtMs + RESEND_TIMEOUT * 1000;
    const remainingMs = expiresAt - Date.now();

    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
};

export default function VerifiedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
    const [resendRemaining, setResendRemaining] = useState(0);
    const codeSendMutation = useCodeSend();
    const codeVerifyMutation = useCodeVerify();

    const email = searchParams.get("email") ?? "";
    const token = searchParams.get("token") ?? "";

    useEffect(() => {
        const syncTimer = () => {
            const timerStartedAt = localStorage.getItem(RESEND_TIMER_KEY);

            if (!timerStartedAt) {
                setResendRemaining(0);
                return;
            }

            const remaining = getResendRemainingSeconds(timerStartedAt);

            if (remaining <= 0) {
                localStorage.removeItem(RESEND_TIMER_KEY);
                setResendRemaining(0);
                return;
            }

            setResendRemaining(remaining);
        };

        syncTimer();
        const intervalId = window.setInterval(syncTimer, 1000);

        return () => window.clearInterval(intervalId);
    }, []);

    const focusInput = (index: number) => {
        const element = document.getElementById(
            `verification-code-${index}`,
        ) as HTMLInputElement | null;

        if (!element) {
            return;
        }

        element.focus();
        element.select();
    };

    const handleCodeResend = async () => {
        if (resendRemaining > 0) {
            return;
        }

        if (!email || !token) {
            toast.warning({
                title: "Недостаточно данных",
                description:
                    "Не удалось получить email или токен для отправки кода.",
            });
            return;
        }

        try {
            await codeSendMutation.mutateAsync({ email, token });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Не удалось отправить код повторно";

            toast.danger({
                title: "Ошибка отправки",
                description: message,
            });
            return;
        }

        const timerStartedAt = new Date().toISOString();
        localStorage.setItem(RESEND_TIMER_KEY, timerStartedAt);
        setResendRemaining(RESEND_TIMEOUT);

        toast.success({
            title: "Код отправлен повторно",
            description: "Новый код подтверждения отправлен.",
        });
    };

    const applyDigits = (startIndex: number, digits: string) => {
        const nextCode = [...code];
        let currentIndex = startIndex;

        for (const digit of digits) {
            if (currentIndex >= CODE_LENGTH) {
                break;
            }

            nextCode[currentIndex] = digit;
            currentIndex += 1;
        }

        setCode(nextCode);

        if (currentIndex < CODE_LENGTH) {
            focusInput(currentIndex);
            return;
        }

        focusInput(CODE_LENGTH - 1);
    };

    const handleChange = (index: number, value: string) => {
        const digits = value.replace(/\D/g, "");

        if (!digits) {
            const nextCode = [...code];
            nextCode[index] = "";
            setCode(nextCode);
            return;
        }

        applyDigits(index, digits);
    };

    const handleKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key !== "Backspace") {
            return;
        }

        if (code[index]) {
            const nextCode = [...code];
            nextCode[index] = "";
            setCode(nextCode);
            return;
        }

        if (index === 0) {
            return;
        }

        const nextCode = [...code];
        nextCode[index - 1] = "";
        setCode(nextCode);
        focusInput(index - 1);
    };

    const handlePaste = (
        index: number,
        event: React.ClipboardEvent<HTMLInputElement>,
    ) => {
        event.preventDefault();
        const digits = event.clipboardData.getData("text").replace(/\D/g, "");

        if (!digits) {
            return;
        }

        applyDigits(index, digits);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const verificationCode = code.join("");

        if (verificationCode.length !== CODE_LENGTH) {
            toast.warning({
                title: "Код не заполнен",
                description: "Введите все 6 цифр из письма или сообщения.",
            });
            return;
        }
        if (!email || !token) {
            toast.warning({
                title: "Недостаточно данных",
                description:
                    "Не удалось получить email или токен для проверки кода.",
            });
            return;
        }

        try {
            await codeVerifyMutation.mutateAsync({
                email,
                token,
                code: verificationCode,
            });
            router.push("/auth/login?verified=1");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Не удалось подтвердить код";

            toast.danger({
                title: "Ошибка подтверждения",
                description: message,
            });
        }
    };

    const resendLabel =
        resendRemaining > 0
            ? `Повторить через ${String(resendRemaining).padStart(2, "0")} с`
            : "Получить код";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-main-400">
                    Подтверждение
                </p>
                <h2 className="text-2xl font-semibold text-main-100">
                    Введите код
                </h2>
                <p className="max-w-md text-sm leading-6 text-main-300">
                    Мы отправили 6-значный код подтверждения. Введите его, чтобы
                    завершить проверку аккаунта.
                </p>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                    {code.map((digit, index) => (
                        <InputSmall
                            key={index}
                            id={`verification-code-${index}`}
                            type="text"
                            inputMode="numeric"
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            maxLength={6}
                            value={digit}
                            onChange={(event) =>
                                handleChange(index, event.target.value)
                            }
                            onKeyDown={(event) => handleKeyDown(index, event)}
                            onPaste={(event) => handlePaste(index, event)}
                            onFocus={(event) => event.target.select()}
                            placeholder="0"
                            className="h-14 px-0 text-center text-lg"
                        />
                    ))}
                </div>
            </div>

            <Button
                type="submit"
                variant="primary"
                shape="rounded-lg"
                className="h-11 w-full text-sm"
                disabled={codeVerifyMutation.isPending}
            >
                {codeVerifyMutation.isPending ? "Проверяем..." : "Ввести код"}
            </Button>
            <Button
                type="button"
                variant="secondary"
                shape="rounded-lg"
                onClick={handleCodeResend}
                className="h-11 w-full text-sm gap-2"
                disabled={resendRemaining > 0 || codeSendMutation.isPending}
            >
                <Icon icon="mdi:refresh" className="h-4 w-4" />
                {codeSendMutation.isPending ? "Отправляем..." : resendLabel}
            </Button>

            <Link
                href="/auth/login"
                className="block text-xs text-main-300 hover:underline"
            >
                Вернуться ко входу
            </Link>
        </form>
    );
}
