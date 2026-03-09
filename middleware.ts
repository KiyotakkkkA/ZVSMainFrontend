import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthRule } from "./config/authRules";

const ACCESS_TOKEN_COOKIE = "zvs.accessToken";

const handleAuthMiddleware = (request: NextRequest) => {
    const { pathname, search } = request.nextUrl;
    const authRule = resolveAuthRule(pathname);

    if (authRule === undefined) {
        return NextResponse.next();
    }

    const hasAccessToken = Boolean(
        request.cookies.get(ACCESS_TOKEN_COOKIE)?.value,
    );

    if (authRule === true && !hasAccessToken) {
        const loginUrl = new URL("/auth/login", request.url);
        const returnTo = `${pathname}${search}`;

        if (returnTo !== "/panel") {
            loginUrl.searchParams.set("returnTo", returnTo);
        }

        return NextResponse.redirect(loginUrl);
    }

    if (authRule === false && hasAccessToken) {
        return NextResponse.redirect(new URL("/panel", request.url));
    }

    return NextResponse.next();
};

export function middleware(request: NextRequest) {
    return handleAuthMiddleware(request);
}

export function proxy(request: NextRequest) {
    return handleAuthMiddleware(request);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
