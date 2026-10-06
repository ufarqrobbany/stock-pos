import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { type StockInItem, StockInTable } from '@/features/inventory/stockInTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Stock In',
};

const StockIn: StockInItem[] = [
    // data dummy
    {
        id: '1',
        productName: 'Indomie',
        refNo: 'IN-202609001',
        supplier: 'PT Indofood',
        totalItems: 150,
        date: '2026-09-28',
    },
    {
        id: '2',
        productName: 'Ultramilk',
        refNo: 'IN-202609002',
        supplier: 'PT Ultrajaya Milk Industry',
        totalItems: 120,
        date: '2026-09-29',
    },
];

export default async function StockInPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <Stack gap="md" p="xl">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>Stock In (Stok Masuk)</Title>
                        <Text c="neutral.4" size="sm">
                            Catat dan kelola penerimaan stok barang masuk dari supplier.
                        </Text>
                    </div>
                    <Button color="primary" leftSection={<IconPlus size={16} />}>
                        Tambah Stok Masuk
                    </Button>
                </Group>

                <StockInTable data={StockIn} />
            </Stack>
        </RoleWrapper>
    );
}
