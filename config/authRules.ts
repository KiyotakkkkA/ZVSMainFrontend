export type AuthRule = {
    pattern: string;
    auth?: boolean;
};

export const AUTH_ROUTE_RULES: AuthRule[] = [
    { pattern: "/panel/:path*", auth: true },
    { pattern: "/auth/:path*", auth: false },
];

const isPrefixPattern = (pattern: string) => pattern.endsWith("/:path*");

const matchesPattern = (pathname: string, pattern: string) => {
    if (!isPrefixPattern(pattern)) {
        return pathname === pattern;
    }

    const prefix = pattern.slice(0, -7);
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

export const resolveAuthRule = (pathname: string): boolean | undefined => {
    const matchedRule = AUTH_ROUTE_RULES.find((rule) =>
        matchesPattern(pathname, rule.pattern),
    );

    return matchedRule?.auth;
};
