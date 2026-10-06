import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { StockOpnameTable } from '@/features/inventory/stockOpnameTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Stock Opname',
};

export default async function StockOpnamePage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <StockOpnameTable />
        </RoleWrapper>
    );
}
