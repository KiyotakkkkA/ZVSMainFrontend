"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button, Loader, Modal } from "@/components/atoms";
import { useMe, useRevokeSession, useSessions } from "@/hooks/useAuth";
import { userStore } from "@/stores/userStore";
import { Icon } from "@iconify/react";

const noopSubscribe = () => () => {};

const formatIsoDateTime = (iso: string) => {
    return iso.replace("T", " ").replace("Z", " UTC");
};

const deviceTypeIcons = {
    desktop: "mdi:desktop-classic",
    tablet: "mdi:tablet",
    mobile: "mdi:cellphone",
    unknown: "mdi:devices",
};

const browserIcons: Record<string, string> = {
    Chrome: "mdi:google-chrome",
    Firefox: "mdi:firefox", // TODO: Заменить на SVG , на mdi она deprecated
    Safari: "mdi:safari", // TODO: Заменить на SVG , на mdi она deprecated
    Edge: "mdi:microsoft-edge", // TODO: Заменить на SVG , на mdi она deprecated
    Opera: "mdi:opera", // TODO: Заменить на SVG , на mdi она deprecated
    Unknown: "mdi:web",
};

const osIcons: Record<string, string> = {
    Windows: "mdi:microsoft", // TODO: Заменить на SVG , на mdi она deprecated
    macOS: "mdi:apple", // TODO: Заменить на SVG , на mdi она deprecated
    Linux: "mdi:linux", // TODO: Заменить на SVG , на mdi она deprecated
    Android: "mdi:android", // TODO: Заменить на SVG , на mdi она deprecated
    iOS: "mdi:apple", // TODO: Заменить на SVG , на mdi она deprecated
    Unknown: "mdi:account",
};

export default function PanelProfilePage() {
    const isHydrated = useSyncExternalStore(
        noopSubscribe,
        () => true,
        () => false,
    );
    const { data, isLoading, isError, error } = useMe();
    const {
        data: sessions,
        isLoading: isSessionsLoading,
        isError: isSessionsError,
        error: sessionsError,
    } = useSessions({
        enabled:
            isHydrated &&
            Boolean(userStore.accessToken || userStore.refreshToken),
    });
    const revokeSessionMutation = useRevokeSession();

    const [sessionToRevokeId, setSessionToRevokeId] = useState<number | null>(
        null,
    );

    const user = data ?? userStore.user;

    const selectedSession = useMemo(
        () => sessions?.find((session) => session.id === sessionToRevokeId),
        [sessions, sessionToRevokeId],
    );

    const closeRevokeModal = () => {
        setSessionToRevokeId(null);
    };

    const confirmRevokeSession = async () => {
        if (sessionToRevokeId === null) {
            return;
        }

        try {
            await revokeSessionMutation.mutateAsync(sessionToRevokeId);
            closeRevokeModal();
        } catch {}
    };

    if (!isHydrated) {
        return (
            <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl sm:p-8">
                <span className="flex items-center gap-2 text-sm text-main-300">
                    <Loader />
                    Загружаем данные...
                </span>
            </section>
        );
    }

    if (isLoading) {
        return (
            <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl sm:p-8">
                <div className="text-sm text-main-300">
                    Загружаем профиль...
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl sm:p-8">
                <div className="max-w-xl rounded-2xl border border-rose-700/70 bg-main-900/80 p-5">
                    <p className="text-sm font-semibold text-rose-300">
                        Не удалось загрузить профиль
                    </p>
                    <p className="mt-2 text-xs text-main-300">
                        {error.message}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl sm:p-8">
                <div className="relative flex h-full flex-col gap-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-main-400">
                            Профиль
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-main-100">
                            Добро пожаловать, {user?.email ?? "пользователь"}!
                        </h1>
                    </div>

                    <div className="rounded-2xl">
                        <p className="text-xs uppercase tracking-[0.14em] text-main-400">
                            Активные браузерные сессии
                        </p>

                        {isSessionsLoading ? (
                            <p className="mt-3 text-sm text-main-300">
                                Загружаем список сессий...
                            </p>
                        ) : null}

                        {isSessionsError ? (
                            <p className="mt-3 text-sm text-rose-300">
                                {sessionsError.message}
                            </p>
                        ) : null}

                        {!isSessionsLoading && !isSessionsError ? (
                            sessions && sessions.length > 0 ? (
                                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                    {sessions.map((session) => (
                                        <article
                                            key={session.id}
                                            className="rounded-xl border border-main-700/70 bg-main-900/80 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex gap-2 items-center">
                                                    <Icon
                                                        className="p-1 rounded-md bg-main-600/50 text-main-300"
                                                        icon={
                                                            deviceTypeIcons[
                                                                session.deviceType as keyof typeof deviceTypeIcons
                                                            ] ||
                                                            deviceTypeIcons.unknown
                                                        }
                                                        width={32}
                                                        height={32}
                                                    ></Icon>
                                                    <Icon
                                                        className="p-1 rounded-md bg-main-600/50 text-main-300"
                                                        icon={
                                                            browserIcons[
                                                                session.browser as keyof typeof browserIcons
                                                            ] ||
                                                            browserIcons.Unknown
                                                        }
                                                        width={32}
                                                        height={32}
                                                    ></Icon>
                                                    <Icon
                                                        className="p-1 rounded-md bg-main-600/50 text-main-300"
                                                        icon={
                                                            osIcons[
                                                                session.os as keyof typeof osIcons
                                                            ] || osIcons.Unknown
                                                        }
                                                        width={32}
                                                        height={32}
                                                    ></Icon>
                                                </div>

                                                <Button
                                                    variant="danger"
                                                    shape="rounded-lg"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() =>
                                                        setSessionToRevokeId(
                                                            session.id,
                                                        )
                                                    }
                                                >
                                                    Отозвать
                                                </Button>
                                            </div>

                                            <div className="mt-3 space-y-1.5 text-xs text-main-300">
                                                <p>
                                                    <span className="text-main-400">
                                                        IP:
                                                    </span>{" "}
                                                    {session.ipAddress}
                                                </p>
                                                <p className="truncate">
                                                    <span className="text-main-400">
                                                        User-Agent:
                                                    </span>{" "}
                                                    {session.userAgent}
                                                </p>
                                                <p>
                                                    <span className="text-main-400">
                                                        Создана:
                                                    </span>{" "}
                                                    {formatIsoDateTime(
                                                        session.createdAt,
                                                    )}
                                                </p>
                                                <p>
                                                    <span className="text-main-400">
                                                        Истекает:
                                                    </span>{" "}
                                                    {formatIsoDateTime(
                                                        session.expiresAt,
                                                    )}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-main-400">
                                    Активные сессии не найдены.
                                </p>
                            )
                        ) : null}
                    </div>
                </div>
            </section>

            <Modal
                open={sessionToRevokeId !== null}
                onClose={closeRevokeModal}
                title="Отозвать сессию"
                className="max-w-md"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={closeRevokeModal}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="danger"
                            shape="rounded-lg"
                            className="h-9 px-4"
                            onClick={confirmRevokeSession}
                            disabled={revokeSessionMutation.isPending}
                        >
                            {revokeSessionMutation.isPending
                                ? "Отзываем..."
                                : "Отозвать"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-2 text-sm text-main-300">
                    <p>Подтвердите отзыв выбранной сессии.</p>
                    <p>
                        <span className="text-main-400">ID сессии:</span>{" "}
                        {selectedSession?.id ?? "-"}
                    </p>
                    <p>
                        <span className="text-main-400">Устройство:</span>{" "}
                        {selectedSession?.device ?? "-"}
                    </p>
                    {revokeSessionMutation.isError ? (
                        <p className="text-xs text-rose-300">
                            {revokeSessionMutation.error.message}
                        </p>
                    ) : null}
                </div>
            </Modal>
        </>
    );
}
