import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { CategoryTable } from '@/features/products/components/categoryTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Kategori Produk',
};

export default async function CategoriesPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <div style={{ paddingLeft: 'var(--mantine-spacing-xl)', paddingRight: 'var(--mantine-spacing-xl)' }}>
                <CategoryTable />
            </div>
        </RoleWrapper>
    );
}
