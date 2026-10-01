import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { ProductTable } from '@/features/products/components/productTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Daftar Produk',
};

export default async function ProductsPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <Stack gap="md" p="xl">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>Master Produk &amp; SKU</Title>
                        <Text c="neutral.4" size="sm">
                            Kelola data utama produk, foto, atribut varian, harga jual, dan batas stok minimum.
                        </Text>
                    </div>
                    <Link href="/products/new">
                        <Button color="primary" leftSection={<IconPlus size={16} />}>
                            Tambah Master Produk
                        </Button>
                    </Link>
                </Group>

                <ProductTable />
            </Stack>
        </RoleWrapper>
    );
}
