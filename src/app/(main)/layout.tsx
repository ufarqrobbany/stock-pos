import { cookies } from 'next/headers';
import { MainLayout } from '@/components/layout/MainLayout';
import { parseSessionCookie } from '@/utils/session';

export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userSession = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return <MainLayout user={userSession}>{children}</MainLayout>;
}
