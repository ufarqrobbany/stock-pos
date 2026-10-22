'use client';

import { Card, Text, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { DataTable } from '@/components/common/DataTable';
import type { Column } from '@/components/common/DataTable/types';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import type { RecentTransactionRow } from '../types';

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
    const data = useLiveQuery<RecentTransactionRow[]>(() => dashboardService.getRecentTransactions(5), []);

    const loading = data === undefined;

    return (
        <Card withBorder shadow="none" p="md" radius="md" h="100%">
            <Title order={4} mb="xs">
                Transaksi Terakhir
            </Title>

            <DataTable
                columns={columns}
                data={data ?? []}
                loading={loading}
                getRowKey={(row) => row.id}
                emptyText="Belum ada transaksi."
                minWidth={440}
            />
        </Card>
    );
}
