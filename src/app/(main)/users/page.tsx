import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { UserManagementView } from '@/features/users/components/UserManagementView';
import { UserProvider } from '@/features/users/context/UserContext';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Manajemen Pengguna',
};

export default async function UsersPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER']} user={user} type="page">
            <UserProvider currentUserId={user?.id}>
                <UserManagementView />
            </UserProvider>
        </RoleWrapper>
    );
}
