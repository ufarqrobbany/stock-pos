'use client';

import { ActionIcon, Badge, Card, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Column, DataTable } from '@/components/common/DataTable';
import { type StockHistoryItem, stockHistoryService } from './services/stockService';

const refTypeBadgeMap: Record<StockHistoryItem['referenceType'], { label: string; color: string }> = {
    STOCK_ENTRY: { label: 'STOK MASUK', color: 'green' },
    STOCK_ADJUSTMENT: { label: 'OPNAME / KOREKSI', color: 'orange' },
    SALE: { label: 'PENJUALAN', color: 'blue' },
};

const columns: Column<StockHistoryItem>[] = [
    { id: 'date', label: 'Waktu Transaksi', render: (row) => row.date },
    { id: 'productName', label: 'Nama Produk', render: (row) => row.productName },
    {
        id: 'referenceType',
        label: 'Sumber Mutasi',
        render: (row) => {
            const config = refTypeBadgeMap[row.referenceType] ?? { label: row.referenceType, color: 'gray' };
            return (
                <Badge color={config.color} variant="light">
                    {config.label}
                </Badge>
            );
        },
    },
    { id: 'before', label: 'Stok Awal', render: (row) => row.before },
    {
        id: 'change',
        label: 'Perubahan',
        render: (row) => (
            <Text fw={600} c={row.change > 0 ? 'green' : row.change < 0 ? 'red' : 'gray'}>
                {row.change > 0 ? `+${row.change}` : row.change}
            </Text>
        ),
    },
    { id: 'after', label: 'Stok Akhir', render: (row) => row.after },
];

export function StockHistoryTable() {
    const [data, setData] = useState<StockHistoryItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setData(await stockHistoryService.loadStockHistoryList());
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchSearch = !search.trim() || item.productName.toLowerCase().includes(search.toLowerCase());
            const matchType = !selectedType || item.referenceType === selectedType;

            return matchSearch && matchType;
        });
    }, [data, search, selectedType]);

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
                                        onClick={() => setSearch('')}
                                    >
                                        <IconX size={14} />
                                    </ActionIcon>
                                ) : null
                            }
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
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
                            onChange={setSelectedType}
                        />
                    </Group>
                    <Badge variant="light" color="blue">
                        {filteredData.length} LOG DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    getRowKey={(item) => item.id}
                    emptyText="Belum ada riwayat pergerakan stok."
                />
            </Card>
        </Stack>
    );
}
