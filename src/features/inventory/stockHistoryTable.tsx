'use client';

import { ActionIcon, Badge, Card, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { type StockHistoryItem, stockHistoryService } from './services/stockService';

const refTypeBadgeMap: Record<StockHistoryItem['referenceType'], { label: string; color: string }> = {
    STOCK_ENTRY: { label: 'STOK MASUK', color: 'green' },
    STOCK_ADJUSTMENT: { label: 'OPNAME / KOREKSI', color: 'orange' },
    SALE: { label: 'PENJUALAN', color: 'blue' },
};

const columns = [
    { id: 'date', label: 'Waktu Transaksi', render: (row: StockHistoryItem) => row.date },
    { id: 'productName', label: 'Nama Produk', render: (row: StockHistoryItem) => row.productName },
    {
        id: 'referenceType',
        label: 'Sumber Mutasi',
        render: (row: StockHistoryItem) => {
            const config = refTypeBadgeMap[row.referenceType] ?? { label: row.referenceType, color: 'gray' };
            return (
                <Badge color={config.color} variant="light">
                    {config.label}
                </Badge>
            );
        },
    },
    { id: 'before', label: 'Stok Awal', render: (row: StockHistoryItem) => row.before },
    {
        id: 'change',
        label: 'Perubahan',
        render: (row: StockHistoryItem) => (
            <Text fw={600} c={row.change > 0 ? 'green' : row.change < 0 ? 'red' : 'gray'}>
                {row.change > 0 ? `+${row.change}` : row.change}
            </Text>
        ),
    },
    { id: 'after', label: 'Stok Akhir', render: (row: StockHistoryItem) => row.after },
];

export function StockHistoryTable() {
    const [data, setData] = useState<StockHistoryItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await stockHistoryService.loadStockHistoryPaginated({
            page,
            pageSize,
            search,
            referenceType: selectedType ?? undefined,
        });
        setData(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setLoading(false);
    }, [page, pageSize, search, selectedType]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const pagination = {
        page,
        pageSize,
        total,
        totalPages,
        onPageChange: (newPage: number) => setPage(newPage),
    };

    return (
        <Stack gap="md" p="xl">
            <div>
                <Title order={2}>Riwayat Stok (Stock History)</Title>
                <Text c="neutral.4" size="sm">
                    Log seluruh pergerakan dan mutasi stok barang (Masuk, Opname, Penjualan).
                </Text>
            </div>

            <Card withBorder p="md" radius="md">
                <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs">
                        <TextInput
                            w={300}
                            placeholder="Cari Nama Produk..."
                            leftSection={<IconSearch size={16} />}
                            rightSection={
                                search ? (
                                    <ActionIcon
                                        variant="subtle"
                                        color="neutral"
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            setPage(1);
                                        }}
                                    >
                                        <IconX size={14} />
                                    </ActionIcon>
                                ) : null
                            }
                            value={search}
                            onChange={(e) => {
                                setSearch(e.currentTarget.value);
                                setPage(1);
                            }}
                        />
                        <Select
                            placeholder="Semua Mutasi"
                            data={[
                                { value: 'STOCK_ENTRY', label: 'Stok Masuk' },
                                { value: 'STOCK_ADJUSTMENT', label: 'Stok Opname' },
                                { value: 'SALE', label: 'Penjualan' },
                            ]}
                            clearable
                            value={selectedType}
                            onChange={(val) => {
                                setSelectedType(val);
                                setPage(1);
                            }}
                        />
                    </Group>
                    <Badge variant="light" color="blue">
                        {total} LOG DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    getRowKey={(item) => item.id}
                    emptyText="Belum ada riwayat pergerakan stok."
                    pagination={pagination}
                />
            </Card>
        </Stack>
    );
}
