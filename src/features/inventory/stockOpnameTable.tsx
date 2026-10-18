'use client';

import { ActionIcon, Badge, Button, Card, Group, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { StockAdjustmentType } from '@/db/types/stock';
import { StockOpnameForm, type StockOpnameFormValues } from './components/stockOpnameForm';
import { stockOpnameService } from './services/stockService';

export type StockOpnameItem = {
    id: string;
    refNo: string;
    productName: string;
    type: StockAdjustmentType;
    quantityChange: number;
    reason: string;
    date: string;
};

const typeBadgeMap: Record<StockAdjustmentType, { label: string; color: string }> = {
    DAMAGED: { label: 'RUSAK', color: 'red' },
    LOST: { label: 'HILANG', color: 'orange' },
    CORRECTION: { label: 'SELISIH HITUNG', color: 'blue' },
    OTHER: { label: 'LAINNYA', color: 'gray' },
};

const columns = [
    { id: 'refNo', label: 'No. Referensi', render: (row: StockOpnameItem) => row.refNo },
    { id: 'productName', label: 'Nama Produk', render: (row: StockOpnameItem) => row.productName },
    {
        id: 'type',
        label: 'Tipe Penyesuaian',
        render: (row: StockOpnameItem) => {
            const config = typeBadgeMap[row.type] ?? { label: row.type, color: 'gray' };
            return (
                <Badge color={config.color} variant="light">
                    {config.label}
                </Badge>
            );
        },
    },
    {
        id: 'quantityChange',
        label: 'Jumlah Perubahan',
        render: (row: StockOpnameItem) => (
            <Text fw={600} c={row.quantityChange > 0 ? 'green' : 'red'}>
                {row.quantityChange > 0 ? `+${row.quantityChange}` : row.quantityChange}
            </Text>
        ),
    },
    { id: 'reason', label: 'Alasan / Catatan', render: (row: StockOpnameItem) => row.reason },
    { id: 'date', label: 'Tanggal Penyesuaian', render: (row: StockOpnameItem) => row.date },
];

export function StockOpnameTable() {
    const [data, setData] = useState<StockOpnameItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await stockOpnameService.loadStockOpnamePaginated({
            page,
            pageSize,
            search,
            type: selectedType ?? undefined,
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

    const handleSubmit = async (values: StockOpnameFormValues) => {
        setLoading(true);
        try {
            const success = await stockOpnameService.createStockAdjustment({
                productId: values.productId as string,
                variantId: null,
                type: values.type,
                quantityChange: typeof values.quantityChange === 'number' ? values.quantityChange : 0,
                reason: values.reason.trim(),
                createdBy: 'system',
            });

            if (!success) return;

            await refresh();
            close();
        } catch (error) {
            console.error('Gagal menyimpan stock opname:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack gap="md" p="xl">
            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Stock Opname (Penyesuaian Stok)</Title>
                    <Text c="neutral.4" size="sm">
                        Penyesuaian stok fisik di gudang dan stok sistem.
                    </Text>
                </div>
                <Button color="orange" leftSection={<IconPlus size={16} />} onClick={open}>
                    Buat Stock Opname
                </Button>
            </Group>

            <Card withBorder p="md" radius="md">
                <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs">
                        <TextInput
                            w={300}
                            placeholder="Cari Nama Produk atau Ref..."
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
                            placeholder="Semua Tipe Penyesuaian"
                            data={[
                                { value: 'DAMAGED', label: 'RUSAK' },
                                { value: 'LOST', label: 'HILANG' },
                                { value: 'CORRECTION', label: 'SELISIH HITUNG' },
                            ]}
                            clearable
                            value={selectedType}
                            onChange={(val) => {
                                setSelectedType(val);
                                setPage(1);
                            }}
                        />
                    </Group>
                    <Badge variant="light" color="orange">
                        {total} RECORD DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    getRowKey={(item) => item.id}
                    emptyText="Data penyesuaian stok tidak ditemukan."
                    pagination={pagination}
                />
            </Card>

            <Modal opened={opened} onClose={close} title="Buat Stock Opname">
                <StockOpnameForm onSubmit={handleSubmit} loading={loading} onCancel={close} />
            </Modal>
        </Stack>
    );
}
