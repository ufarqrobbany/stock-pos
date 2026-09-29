import { Group, Stack, Text, Title } from '@mantine/core';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { CategoryTable } from '@/features/products/components/categoryTable';
import { parseSessionCookie } from '@/utils/session';

export default async function CategoriesPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>Kelola Kategori</Title>
                        <Text c="neutral.4" size="sm">
                            Tambah dan kelola kategori produk.
                        </Text>
                    </div>
                </Group>

                <CategoryTable />
            </Stack>
        </RoleWrapper>
    );
}
