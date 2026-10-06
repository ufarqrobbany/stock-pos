import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { ProductManagementView } from '@/features/products/components/ProductManagementView';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Daftar Produk',
};

export default async function ProductsPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <ProductManagementView />
        </RoleWrapper>
    );
}
