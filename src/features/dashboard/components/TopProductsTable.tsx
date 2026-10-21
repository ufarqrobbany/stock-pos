'use client';

import { Badge, Card, Group, SegmentedControl, Skeleton, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { Column } from '@/components/common/DataTable/types';
import { dashboardService, getPeriodRange } from '@/features/dashboard/services/dashboardService';
import type { DashboardPeriod } from '@/features/dashboard/utils/dashboardUtils';
import { DASHBOARD_PERIODS } from '@/features/dashboard/utils/dashboardUtils';
import type { TopProductRow } from '../types';

const RANK_COLORS: Record<number, string> = { 1: 'yellow', 2: 'gray', 3: 'orange' };

const columns: Column<TopProductRow>[] = [
    {
        id: 'rank',
        label: '',
        width: 52,
        align: 'center',
        render: (row) =>
            row.rank <= 3 ? (
                <ThemeIcon size="sm" radius="xl" color={RANK_COLORS[row.rank]} variant="filled">
                    <Text size="xs" fw={800} c="white">
                        {row.rank}
                    </Text>
                </ThemeIcon>
            ) : (
                <Text size="sm" fw={600} c="dimmed" ta="center">
                    {row.rank}
                </Text>
            ),
    },
    {
        id: 'name',
        label: 'Nama Produk',
        render: (row) => (
            <Stack gap={2}>
                <Text size="sm" fw={500}>
                    {row.name}
                </Text>
                <Badge size="xs" variant="light" color="gray" radius="sm">
                    {row.category}
                </Badge>
            </Stack>
        ),
    },
    {
        id: 'sku',
        label: 'SKU',
        width: 150,
        render: (row) => (
            <Text size="xs" ff="monospace" c="dimmed">
                {row.sku}
            </Text>
        ),
    },
    {
        id: 'qtySold',
        label: 'Terjual',
        width: 90,
        align: 'center',
        render: (row) => (
            <Text size="sm" fw={700}>
                {row.qtySold.toLocaleString('id-ID')}
            </Text>
        ),
    },
];

export function TopProductsTable() {
    const [period, setPeriod] = useState<DashboardPeriod>('Minggu Ini');

    const data = useLiveQuery<TopProductRow[]>(() => {
        const { start, end } = getPeriodRange(period);
        return dashboardService.getTopProducts(start, end, 5);
    }, [period]);

    const loading = data === undefined;

    return (
        <Card withBorder shadow="none" p="md" radius="md">
            <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
                <Stack gap={2}>
                    <Title order={4}>Produk Terlaris</Title>
                    <Text size="xs" c="dimmed">
                        Top 5 produk dengan penjualan tertinggi.
                    </Text>
                </Stack>
                <SegmentedControl
                    size="xs"
                    data={DASHBOARD_PERIODS}
                    value={period}
                    onChange={(val) => setPeriod(val as DashboardPeriod)}
                />
            </Group>

            {loading ? (
                <Stack gap="xs">
                    {['skeleton-0', 'skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((skeletonKey) => (
                        <Skeleton key={skeletonKey} height={44} radius="sm" />
                    ))}
                </Stack>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    getRowKey={(row) => `${row.productId}::${row.variantId ?? 'none'}`}
                    emptyText="Belum ada data penjualan untuk periode ini."
                />
            )}
        </Card>
    );
}
