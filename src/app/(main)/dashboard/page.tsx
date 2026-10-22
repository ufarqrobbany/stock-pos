import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { DashboardView } from '@/features/dashboard/components/DashboardView';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Dashboard',
};

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER']} user={user} type="page">
            <DashboardView />
        </RoleWrapper>
    );
}
