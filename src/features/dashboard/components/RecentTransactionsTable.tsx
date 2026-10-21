'use client';

import { Badge, Card, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { DataTable } from '@/components/common/DataTable';
import type { Column } from '@/components/common/DataTable/types';
import type { RecentTransactionRow } from '@/db/repositories/dashboardRepository';
import { dashboardRepository } from '@/features/dashboard/services/dashboardService';

const METHOD_COLOR: Record<string, string> = {
    CASH: 'teal',
    QRIS: 'violet',
    TRANSFER: 'blue',
};

function formatDateTime(isoString: string): string {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    return `${time} · ${date}`;
}

const columns: Column<RecentTransactionRow>[] = [
    {
        id: 'transactionNumber',
        label: 'No. Transaksi',
        render: (row) => (
            <Text size="sm" fw={600} ff="monospace">
                {row.transactionNumber}
            </Text>
        ),
    },
    {
        id: 'createdAt',
        label: 'Waktu',
        render: (row) => (
            <Text size="sm" c="dimmed">
                {formatDateTime(row.createdAt)}
            </Text>
        ),
    },
    {
        id: 'cashierName',
        label: 'Nama Kasir',
        render: (row) => <Text size="sm">{row.cashierName}</Text>,
    },
    {
        id: 'paymentMethod',
        label: 'Metode',
        width: 110,
        align: 'center',
        render: (row) => (
            <Badge
                size="sm"
                variant="light"
                color={METHOD_COLOR[row.paymentMethod] ?? 'gray'}
            >
                {row.paymentMethod}
            </Badge>
        ),
    },
    {
        id: 'total',
        label: 'Total',
        width: 130,
        align: 'right',
        render: (row) => (
            <Text size="sm" fw={700} c="green">
                {row.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
            </Text>
        ),
    },
];

export function RecentTransactionsTable() {
    const data = useLiveQuery<RecentTransactionRow[]>(
        () => dashboardRepository.getRecentTransactions(5),
        []
    );

    const loading = data === undefined;

    return (
        <Card withBorder shadow="none" p="md" radius="md">
            <Stack gap={2} mb="md">
                <Title order={4}>Transaksi Terakhir</Title>
                <Text size="xs" c="dimmed">
                    Daftar transaksi penjualan kasir yang baru masuk.
                </Text>
            </Stack>

            {loading ? (
                <Stack gap="xs">
                    {['skeleton-0', 'skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((key) => (
                        <Skeleton key={key} height={44} radius="sm" />
                    ))}
                </Stack>
            ) : (
                <DataTable
                    columns={columns}
                    data={data}
                    getRowKey={(row) => row.id}
                    emptyText="Belum ada transaksi."
                />
            )}
        </Card>
    );
}
