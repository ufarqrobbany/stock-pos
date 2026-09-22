import type { SessionUser } from '@/features/auth/types';

export const setSessionCookie = async (user: SessionUser): Promise<void> => {
    if (typeof window === 'undefined') return;

    if ('cookieStore' in window) {
        await (
            window as unknown as { cookieStore: { set: (options: Record<string, unknown>) => Promise<void> } }
        ).cookieStore.set({
            name: 'stockpos_session',
            value: encodeURIComponent(JSON.stringify(user)),
            path: '/',
            sameSite: 'lax',
        });
    }
};

export const parseSessionCookie = (cookieValue?: string): SessionUser | null => {
    if (!cookieValue) return null;
    try {
        return JSON.parse(decodeURIComponent(cookieValue)) as SessionUser;
    } catch {
        return null;
    }
};

export const clearSessionCookie = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    if ('cookieStore' in window) {
        await (
            window as unknown as { cookieStore: { delete: (options: { name: string; path: string }) => Promise<void> } }
        ).cookieStore.delete({
            name: 'stockpos_session',
            path: '/',
        });
    }
};
