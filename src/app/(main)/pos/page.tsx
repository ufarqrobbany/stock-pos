import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { PosView } from '@/features/pos/components/PosView';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Point of Sale (POS)',
};

export default async function PosPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'CASHIER']} user={user} type="page">
            <PosView cashierId={user?.id} cashierName={user?.name} userRole={user?.role} />
        </RoleWrapper>
    );
}
