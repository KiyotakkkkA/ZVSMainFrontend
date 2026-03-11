"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Button, Loader, Modal } from "@/components/atoms";
import { useMe, useRevokeSession, useSessions } from "@/hooks/useAuth";
import { userStore } from "@/stores/userStore";
import { Icon } from "@iconify/react";
import {
    timeAgoResolver,
    dateFormatResolver,
    ipFormatResolver,
    roleNameResolver,
} from "@/utils/resolvers";
import type { AuthSession } from "@/services/api";

const noopSubscribe = () => () => {};

const deviceTypeIcons: Record<string, string> = {
    desktop: "mdi:desktop-classic",
    tablet: "mdi:tablet",
    mobile: "mdi:cellphone",
    unknown: "mdi:devices",
};

const browserIcons: Record<string, string> = {
    Chrome: "mdi:google-chrome",
    Firefox: "mdi:firefox",
    Safari: "mdi:safari",
    Edge: "mdi:microsoft-edge",
    Opera: "mdi:opera",
    "ZVS Assistant": "mdi:robot",
    Unknown: "mdi:web",
};

const osIcons: Record<string, string> = {
    Windows: "mdi:microsoft",
    macOS: "mdi:apple",
    Linux: "mdi:linux",
    Android: "mdi:android",
    iOS: "mdi:apple",
    Unknown: "mdi:account",
};

function SessionCard({
    session,
    onRevoke,
}: {
    session: AuthSession;
    onRevoke: (id: number) => void;
}) {
    const browserIcon =
        browserIcons[session.browser as keyof typeof browserIcons] ??
        browserIcons.Unknown;
    const osIcon =
        osIcons[session.os as keyof typeof osIcons] ?? osIcons.Unknown;
    const deviceIcon =
        deviceTypeIcons[session.deviceType as keyof typeof deviceTypeIcons] ??
        deviceTypeIcons.unknown;

    return (
        <article className="group relative rounded-2xl border border-main-700/50 bg-main-800/40 p-5 transition-colors hover:border-main-600/60 hover:bg-main-800/60">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-main-700/50">
                        <Icon
                            icon={deviceIcon}
                            className="text-main-200"
                            width={22}
                            height={22}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-main-100">
                            {session.browser ?? "Браузер"}{" "}
                            <span className="text-main-400">на</span>{" "}
                            {session.os ?? "Unknown"}
                        </p>
                        <p className="text-xs text-main-400">
                            {session.device || session.deviceType}
                        </p>
                    </div>
                </div>

                <Button
                    variant="danger"
                    shape="rounded-lg"
                    className="h-8 px-3 text-xs opacity-60 transition-opacity group-hover:opacity-100"
                    onClick={() => onRevoke(session.id)}
                >
                    Завершить
                </Button>
            </div>

            <div className="mt-4 flex items-center gap-2">
                {[
                    { icon: browserIcon, label: session.browser },
                    { icon: osIcon, label: session.os },
                ].map(({ icon, label }) => (
                    <span
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-main-700/30 px-2.5 py-1 text-[11px] text-main-300"
                    >
                        <Icon icon={icon} width={14} height={14} />
                        {label}
                    </span>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
                <DetailItem
                    icon="mdi:ip-outline"
                    label="IP-адрес"
                    value={ipFormatResolver(session.ipAddress)}
                />
                <DetailItem
                    icon="mdi:clock-outline"
                    label="Создана"
                    value={timeAgoResolver(session.createdAt)}
                    title={dateFormatResolver(session.createdAt)}
                />
                <DetailItem
                    icon="mdi:calendar-clock-outline"
                    label="Истекает"
                    value={dateFormatResolver(session.expiresAt)}
                />
            </div>
        </article>
    );
}

function DetailItem({
    icon,
    label,
    value,
    title,
}: {
    icon: string;
    label: string;
    value: string;
    title?: string;
}) {
    return (
        <div className="flex items-start gap-2" title={title}>
            <Icon
                icon={icon}
                className="mt-0.5 shrink-0 text-main-500"
                width={14}
                height={14}
            />
            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-main-500">
                    {label}
                </p>
                <p className="truncate text-xs text-main-200">{value}</p>
            </div>
        </div>
    );
}

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

    const closeRevokeModal = () => setSessionToRevokeId(null);

    const confirmRevokeSession = async () => {
        if (sessionToRevokeId === null) return;
        try {
            await revokeSessionMutation.mutateAsync(sessionToRevokeId);
            closeRevokeModal();
        } catch {}
    };

    if (!isHydrated) {
        return (
            <section className="flex min-h-[calc(100vh-1.5rem)] items-center justify-center rounded-3xl">
                <span className="flex items-center gap-2 text-sm text-main-300">
                    <Loader />
                    Загружаем данные...
                </span>
            </section>
        );
    }

    if (isLoading) {
        return (
            <section className="flex min-h-[calc(100vh-1.5rem)] items-center justify-center rounded-3xl">
                <span className="flex items-center gap-2 text-sm text-main-300">
                    <Loader />
                    Загружаем профиль...
                </span>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="flex min-h-[calc(100vh-1.5rem)] items-center justify-center rounded-3xl">
                <div className="max-w-md rounded-2xl border border-rose-700/40 bg-rose-950/30 p-6 text-center">
                    <Icon
                        icon="mdi:alert-circle-outline"
                        className="mx-auto text-rose-400"
                        width={36}
                        height={36}
                    />
                    <p className="mt-3 text-sm font-semibold text-rose-300">
                        Не удалось загрузить профиль
                    </p>
                    <p className="mt-1.5 text-xs text-main-400">
                        {error.message}
                    </p>
                </div>
            </section>
        );
    }

    const emailInitial = (user?.email?.[0] ?? "U").toUpperCase();

    return (
        <>
            <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-3xl p-6 sm:p-8">
                <div className="flex h-full flex-col gap-8">
                    <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-main-600 to-main-700 text-xl font-bold text-main-100 shadow-lg shadow-main-900/50">
                            {emailInitial}
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold text-main-100">
                                {user?.email ?? "Пользователь"}
                            </h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                {user?.role && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-900/40 px-2 py-0.5 text-[11px] uppercase tracking-wider text-blue-400">
                                        {roleNameResolver(user.role)}
                                    </span>
                                )}
                                {user?.status && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-900/40 px-2 py-0.5 text-[11px] uppercase tracking-wider text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                        {user.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <Icon
                                icon="mdi:shield-lock-outline"
                                className="text-main-400"
                                width={18}
                                height={18}
                            />
                            <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-main-400">
                                Активные сессии
                            </h2>
                            {sessions && (
                                <span className="ml-1 rounded-md bg-main-700/50 px-1.5 py-0.5 text-[10px] tabular-nums text-main-400">
                                    {sessions.length}
                                </span>
                            )}
                        </div>

                        {isSessionsLoading && (
                            <div className="mt-6 flex items-center gap-2 text-sm text-main-400">
                                <Loader />
                                Загружаем сессии...
                            </div>
                        )}

                        {isSessionsError && (
                            <div className="mt-4 rounded-xl border border-rose-800/40 bg-rose-950/20 p-4">
                                <p className="text-sm text-rose-300">
                                    {sessionsError.message}
                                </p>
                            </div>
                        )}

                        {!isSessionsLoading && !isSessionsError && (
                            <>
                                {sessions && sessions.length > 0 ? (
                                    <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                                        {sessions.map((session) => (
                                            <SessionCard
                                                key={session.id}
                                                session={session}
                                                onRevoke={setSessionToRevokeId}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-6 flex flex-col items-center gap-2 py-12 text-main-500">
                                        <Icon
                                            icon="mdi:check-decagram-outline"
                                            width={32}
                                            height={32}
                                        />
                                        <p className="text-sm">
                                            Активные сессии не найдены
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Modal
                open={sessionToRevokeId !== null}
                onClose={closeRevokeModal}
                title="Завершить сессию"
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
                                : "Завершить"}
                        </Button>
                    </>
                }
            >
                <div className="space-y-3 text-sm text-main-300">
                    <p>Вы уверены, что хотите завершить эту сессию?</p>

                    {selectedSession && (
                        <div className="rounded-xl border border-main-700/40 bg-main-800/50 p-4 space-y-2">
                            <p className="text-xs text-main-200">
                                <span className="text-main-500">
                                    Устройство:{" "}
                                </span>
                                {selectedSession.browser} на{" "}
                                {selectedSession.os}
                            </p>
                            <p className="text-xs text-main-200">
                                <span className="text-main-500">
                                    IP-адрес:{" "}
                                </span>
                                {ipFormatResolver(selectedSession.ipAddress)}
                            </p>
                            <p className="text-xs text-main-200">
                                <span className="text-main-500">Создана: </span>
                                {dateFormatResolver(selectedSession.createdAt)}
                            </p>
                        </div>
                    )}

                    {revokeSessionMutation.isError && (
                        <p className="text-xs text-rose-300">
                            {revokeSessionMutation.error.message}
                        </p>
                    )}
                </div>
            </Modal>
        </>
    );
}
