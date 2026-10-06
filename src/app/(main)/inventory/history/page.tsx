import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { StockHistoryTable } from '@/features/inventory/stockHistoryTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'History',
};

export default async function StockHistoryPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <StockHistoryTable />
        </RoleWrapper>
    );
}
