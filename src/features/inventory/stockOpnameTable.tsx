'use client';

import { ActionIcon, Badge, Card, Group, Select, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { type Column, DataTable } from '@/components/common/DataTable';

export type AdjustmentType = 'DAMAGED' | 'LOST' | 'COUNT_DIFF';

export type StockOpnameItem = {
    id: string;
    refNo: string;
    sku: string;
    productName: string;
    type: AdjustmentType;
    quantityChange: number;
    notes: string;
    date: string;
};

interface StockOpnameTableProps {
    data: StockOpnameItem[];
}

const TYPE_CONFIG: Record<AdjustmentType, { label: string; color: string }> = {
    DAMAGED: { label: 'Rusak', color: 'red' },
    LOST: { label: 'Hilang', color: 'orange' },
    COUNT_DIFF: { label: 'Selisih Hitung', color: 'blue' },
};

const columns: Column<StockOpnameItem>[] = [
    {
        id: 'refNo',
        label: 'No. Referensi',
        render: (row) => row.refNo,
    },
    {
        id: 'sku',
        label: 'SKU',
        render: (row) => row.sku,
    },
    {
        id: 'productName',
        label: 'Nama Produk',
        render: (row) => row.productName,
    },
    {
        id: 'type',
        label: 'Tipe Penyesuaian',
        render: (row) => {
            const config = TYPE_CONFIG[row.type] || { label: row.type, color: 'gray' };
            return (
                <Badge variant="light" color={config.color}>
                    {config.label}
                </Badge>
            );
        },
    },
    {
        id: 'quantityChange',
        label: 'Jumlah Perubahan',
        render: (row) => {
            const isNegative = row.quantityChange < 0;
            return (
                <Badge variant="subtle" color={isNegative ? 'red' : 'green'}>
                    {row.quantityChange > 0 ? `+${row.quantityChange}` : row.quantityChange}
                </Badge>
            );
        },
    },
    {
        id: 'notes',
        label: 'Alasan / Catatan',
        render: (row) => row.notes || '-',
    },
    {
        id: 'date',
        label: 'Tanggal Penyesuaian',
        render: (row) => row.date,
    },
];

export function StockOpnameTable({ data }: StockOpnameTableProps) {
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const query = search.toLowerCase();
            const matchesSearch =
                !search.trim() ||
                item.refNo.toLowerCase().includes(query) ||
                item.sku.toLowerCase().includes(query) ||
                item.productName.toLowerCase().includes(query) ||
                item.notes.toLowerCase().includes(query);

            const matchesType = !selectedType || item.type === selectedType;

            return matchesSearch && matchesType;
        });
    }, [data, search, selectedType]);

    return (
        <Card withBorder p="md" radius="md">
            <Group justify="space-between" align="center" mb="md">
                <Group align="center" gap="sm">
                    <TextInput
                        w={300}
                        placeholder="Cari SKU, Nama Produk, atau Ref..."
                        leftSection={<IconSearch size={16} />}
                        rightSection={
                            search ? (
                                <ActionIcon
                                    variant="subtle"
                                    color="neutral"
                                    size="sm"
                                    onClick={() => setSearch('')}
                                    aria-label="Hapus pencarian"
                                >
                                    <IconX size={14} />
                                </ActionIcon>
                            ) : null
                        }
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                    />

                    <Select
                        w={220}
                        placeholder="Semua Tipe Penyesuaian"
                        clearable
                        data={[
                            { value: 'DAMAGED', label: 'Rusak (Damaged)' },
                            { value: 'LOST', label: 'Hilang (Lost)' },
                            { value: 'COUNT_DIFF', label: 'Selisih Hitung (Count Diff)' },
                        ]}
                        value={selectedType}
                        onChange={setSelectedType}
                    />
                </Group>

                <Badge variant="light" color="primary">
                    {filteredData.length} RECORD DITEMUKAN
                </Badge>
            </Group>

            <DataTable
                columns={columns}
                data={filteredData}
                getRowKey={(item) => item.id}
                emptyText="Data penyesuaian stok opname tidak ditemukan."
            />
        </Card>
    );
}
