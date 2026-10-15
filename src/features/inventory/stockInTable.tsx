'use client';

import { ActionIcon, Badge, Button, Card, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
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

const columns = [
    { id: 'refNo', label: 'No. Referensi', render: (row: StockInItem) => row.refNo },
    { id: 'productName', label: 'Nama Produk', render: (row: StockInItem) => row.productName },
    { id: 'supplier', label: 'Pemasok / Supplier', render: (row: StockInItem) => row.supplier },
    { id: 'totalItems', label: 'Total Item', render: (row: StockInItem) => row.totalItems },
    { id: 'date', label: 'Tanggal Masuk', render: (row: StockInItem) => row.date },
];

export function StockInTable() {
    const [data, setData] = useState<StockInItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const refresh = useCallback(async () => {
        setLoading(true);
        const result = await stockService.loadStockInPaginated({ page, pageSize, search });
        setData(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setLoading(false);
    }, [page, pageSize, search]);

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

    const handleSubmit = async (values: StockInFormValues) => {
        setLoading(true);
        try {
            const success = await stockService.createStockEntry({
                productId: values.productId as string,
                variantId: values.variantId ?? null,
                quantity: typeof values.quantity === 'number' ? values.quantity : 0,
                unitCost: typeof values.unitCost === 'number' ? values.unitCost : 0,
                supplier: values.supplier.trim(),
                source: values.source,
                receivedAt: new Date(values.receivedAt).toISOString(),
                createdBy: 'system',
            });

            if (!success) return;

            await refresh();
            close();
        } catch (error) {
            console.error('Gagal menyimpan stock in:', error);
        } finally {
            setLoading(false);
        }
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
                    <Badge variant="light" color="primary">
                        {total} TRANSAKSI DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    getRowKey={(item) => item.id}
                    emptyText="Data transaksi stok masuk tidak ditemukan."
                    pagination={pagination}
                />
            </Card>

            <Modal opened={opened} onClose={close} title="Tambah Stok Masuk">
                <StockInForm onSubmit={handleSubmit} loading={loading} onCancel={close} />
            </Modal>
        </Stack>
    );
}
