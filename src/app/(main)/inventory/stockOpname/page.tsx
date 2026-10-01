import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { type StockOpnameItem, StockOpnameTable } from '@/features/inventory/stockOpnameTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Stock Opname',
};

const StockOpname: StockOpnameItem[] = [
    {
        id: '1',
        refNo: 'SO-202609001',
        sku: 'IND-GRG-01',
        productName: 'Indomie Goreng',
        type: 'DAMAGED',
        quantityChange: -5,
        notes: 'Kemasan rusak',
        date: '2026-09-28',
    },
    {
        id: '2',
        refNo: 'SO-202609002',
        sku: 'ULT-CKL-1L',
        productName: 'Ultramilk Chocolate 1L',
        type: 'COUNT_DIFF',
        quantityChange: 2,
        notes: 'Bonus dari pemasok belum terinput di sistem',
        date: '2026-09-29',
    },
    {
        id: '3',
        refNo: 'SO-202609003',
        sku: 'WIP-PCH-780',
        productName: 'Wipol Refill 780ml',
        type: 'LOST',
        quantityChange: -1,
        notes: 'Hilang saat display toko',
        date: '2026-09-30',
    },
];

export default async function StockOpnamePage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <Stack gap="md" p="xl">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>Stock Opname (Penyesuaian Stok)</Title>
                        <Text c="neutral.4" size="sm">
                            Penyesuaian stok fisik di gudang dan stok sistem.
                        </Text>
                    </div>
                    <Button color="primary" leftSection={<IconPlus size={16} />}>
                        Buat Stock Opname
                    </Button>
                </Group>

                <StockOpnameTable data={StockOpname} />
            </Stack>
        </RoleWrapper>
    );
}
