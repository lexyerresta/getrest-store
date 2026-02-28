import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Paths that require authentication
    const requireAdminPath = path.startsWith('/admin') && !path.startsWith('/admin/login');
    const requireAdminApi = path.startsWith('/api/admin');

    if (requireAdminPath || requireAdminApi) {
        const session = await getSession();

        if (!session?.admin) {
            if (requireAdminApi) {
                return NextResponse.json(
                    { success: false, error: "Unauthorized" },
                    { status: 401 }
                );
            } else {
                return NextResponse.redirect(new URL("/admin/login", request.url));
            }
        }
    }

    // If already logged in and trying to access /admin/login, redirect to /admin
    if (path.startsWith('/admin/login')) {
        const session = await getSession();
        if (session?.admin) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
