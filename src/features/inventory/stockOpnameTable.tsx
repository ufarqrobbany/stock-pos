'use client';

import { ActionIcon, Badge, Button, Card, Group, Modal, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { StockAdjustmentType } from '@/db/types/stock';
import { StockOpnameForm, type StockOpnameFormValues } from './components/stockOpnameForm';
import { stockOpnameService } from './services/stockService';

export type StockOpnameItem = {
    id: string;
    refNo: string;
    // sku: string;
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
    // { id: 'sku', label: 'SKU', render: (row: StockOpnameItem) => row.sku },
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

    const refresh = useCallback(async () => {
        setData(await stockOpnameService.loadStockOpnameList());
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchSearch =
                !search.trim() ||
                item.refNo.toLowerCase().includes(search.toLowerCase()) ||
                // item.sku.toLowerCase().includes(search.toLowerCase()) ||
                item.productName.toLowerCase().includes(search.toLowerCase());

            const matchType = !selectedType || item.type === selectedType;

            return matchSearch && matchType;
        });
    }, [data, search, selectedType]);

    const handleSubmit = async (values: StockOpnameFormValues) => {
        setLoading(true);

        const success = await stockOpnameService.createStockAdjustment({
            productId: values.productId as string,
            variantId: null,
            type: values.type,
            quantityChange: typeof values.quantityChange === 'number' ? values.quantityChange : 0,
            reason: values.reason.trim(),
            createdBy: 'system',
        });

        setLoading(false);
        if (!success) return;

        await refresh();
        close();
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
                            placeholder="Cari SKU, Nama Produk, atau Ref..."
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
                            placeholder="Semua Tipe Penyesuaian"
                            data={[
                                { value: 'DAMAGED', label: 'RUSAK' },
                                { value: 'LOST', label: 'HILANG' },
                                { value: 'CORRECTION', label: 'SELISIH HITUNG' },
                            ]}
                            clearable
                            value={selectedType}
                            onChange={setSelectedType}
                        />
                    </Group>
                    <Badge variant="light" color="orange">
                        {filteredData.length} RECORD DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    getRowKey={(item) => item.id}
                    emptyText="Data penyesuaian stok tidak ditemukan."
                />
            </Card>

            <Modal opened={opened} onClose={close} title="Buat Stock Opname">
                <StockOpnameForm onSubmit={handleSubmit} loading={loading} onCancel={close} />
            </Modal>
        </Stack>
    );
}
