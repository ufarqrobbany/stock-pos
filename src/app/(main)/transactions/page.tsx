import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Riwayat Transaksi',
};

export default async function TransactionsPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'CASHIER']} user={user} type="page">
            <TransactionsTable />
        </RoleWrapper>
    );
}
