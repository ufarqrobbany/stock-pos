import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { StockInTable } from '@/features/inventory/stockInTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Stock In',
};

export default async function StockInPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <StockInTable />
        </RoleWrapper>
    );
}
