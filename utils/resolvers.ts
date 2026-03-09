export const ipFormatResolver = (raw: string): string => {
    let ip = raw.replace(/^::ffff:/, "");
    if (ip === "::1") ip = "127.0.0.1";
    return ip;
};

export const dateFormatResolver = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const timeAgoResolver = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "только что";
    if (mins < 60) return `${mins} мин. назад`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч. назад`;
    const days = Math.floor(hours / 24);
    return `${days} дн. назад`;
};
