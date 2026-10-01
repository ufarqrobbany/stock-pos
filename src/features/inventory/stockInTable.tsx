'use client';

import { ActionIcon, Badge, Card, Group, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { type Column, DataTable } from '@/components/common/DataTable';

export type StockInItem = {
    id: string;
    refNo: string;
    productName: string;
    supplier: string;
    totalItems: number;
    date: string;
};

interface StockInTableProps {
    data: StockInItem[];
}

const columns: Column<StockInItem>[] = [
    {
        id: 'refNo',
        label: 'No. Referensi',
        render: (row) => row.refNo,
    },
    {
        id: 'productName',
        label: 'Nama Produk',
        render: (row) => row.productName,
    },
    {
        id: 'supplier',
        label: 'Pemasok / Supplier',
        render: (row) => row.supplier,
    },
    {
        id: 'totalItems',
        label: 'Total Item',
        render: (row) => row.totalItems,
    },
    {
        id: 'date',
        label: 'Tanggal Masuk',
        render: (row) => row.date,
    },
];

export function StockInTable({ data }: StockInTableProps) {
    const [search, setSearch] = useState('');

    const filteredData = useMemo(() => {
        if (!search.trim()) return data;

        const query = search.toLowerCase();
        return data.filter(
            (item) => item.refNo.toLowerCase().includes(query) || item.supplier.toLowerCase().includes(query)
        );
    }, [data, search]);

    return (
        <Card withBorder p="md" radius="md">
            <Group justify="space-between" align="center" mb="md">
                <Group align="center" gap="sm">
                    <TextInput
                        w={300}
                        placeholder="Cari No. Referensi atau Supplier..."
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
                </Group>
                <Badge variant="light" color="primary">
                    {filteredData.length} TRANSAKSI DITEMUKAN
                </Badge>
            </Group>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredData}
                getRowKey={(item) => item.id}
                emptyText="Data transaksi stok masuk tidak ditemukan."
            />
        </Card>
    );
}
