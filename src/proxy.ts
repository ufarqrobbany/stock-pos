import { type NextRequest, NextResponse } from 'next/server';
import { parseSessionCookie } from '@/utils/session';

const ROLE_REDIRECT_PATHS: Record<string, string> = {
    OWNER: '/dashboard',
    INVENTORY: '/products',
    CASHIER: '/pos',
};

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = parseSessionCookie(request.cookies.get('stockpos_session')?.value);
    const isLoginPath = pathname.startsWith('/login');

    if (!session && !isLoginPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session && (pathname === '/' || isLoginPath)) {
        return NextResponse.redirect(new URL(ROLE_REDIRECT_PATHS[session.role], request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
