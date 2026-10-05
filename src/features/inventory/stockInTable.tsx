'use client';

import { ActionIcon, Badge, Button, Card, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Column, DataTable } from '@/components/common/DataTable';
import { StockInForm, type StockInFormValues } from './components/stockInForm';
import { stockService } from './services/stockService';

export type StockInItem = {
    id: string;
    refNo: string;
    productName: string;
    supplier: string;
    totalItems: number;
    date: string;
};

const columns: Column<StockInItem>[] = [
    { id: 'refNo', label: 'No. Referensi', render: (row) => row.refNo },
    { id: 'productName', label: 'Nama Produk', render: (row) => row.productName },
    { id: 'supplier', label: 'Pemasok / Supplier', render: (row) => row.supplier },
    { id: 'totalItems', label: 'Total Item', render: (row) => row.totalItems },
    { id: 'date', label: 'Tanggal Masuk', render: (row) => row.date },
];

export function StockInTable() {
    const [data, setData] = useState<StockInItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    const refresh = useCallback(async () => {
        setData(await stockService.loadStockInList());
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const filteredData = useMemo(() => {
        if (!search.trim()) return data;
        const query = search.toLowerCase();
        return data.filter(
            (item) =>
                item.refNo.toLowerCase().includes(query) ||
                item.productName.toLowerCase().includes(query) ||
                item.supplier.toLowerCase().includes(query)
        );
    }, [data, search]);

    const handleSubmit = async (values: StockInFormValues) => {
        setLoading(true);

        const success = await stockService.createStockEntry({
            productId: values.productId as string,
            variantId: null,
            quantity: typeof values.quantity === 'number' ? values.quantity : 0,
            unitCost: typeof values.unitCost === 'number' ? values.unitCost : 0,
            supplier: values.supplier.trim(),
            source: values.source,
            receivedAt: new Date(values.receivedAt).toISOString(),
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
                    <Title order={2}>Stock In (Stok Masuk)</Title>
                    <Text c="neutral.4" size="sm">
                        Catat dan kelola penerimaan stok barang masuk dari supplier.
                    </Text>
                </div>
                <Button color="primary" leftSection={<IconPlus size={16} />} onClick={open}>
                    Tambah Stok Masuk
                </Button>
            </Group>

            <Card withBorder p="md" radius="md">
                <Group justify="space-between" align="center" mb="md">
                    <TextInput
                        w={300}
                        placeholder="Cari No. Ref, Nama Produk, Supplier.."
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
                    <Badge variant="light" color="primary">
                        {filteredData.length} TRANSAKSI DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    getRowKey={(item) => item.id}
                    emptyText="Data transaksi stok masuk tidak ditemukan."
                />
            </Card>

            <Modal opened={opened} onClose={close} title="Tambah Stok Masuk">
                <StockInForm onSubmit={handleSubmit} loading={loading} onCancel={close} />
            </Modal>
        </Stack>
    );
}
