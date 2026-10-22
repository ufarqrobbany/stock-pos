'use client';

import { ActionIcon, Badge, Button, Card, Group, Modal, Text, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowRight, IconPackageImport } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { Column } from '@/components/common/DataTable/types';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import { StockInForm, type StockInFormValues } from '@/features/inventory/components/stockInForm';
import { stockService } from '@/features/inventory/services/stockService';
import type { LowStockRow } from '../types';

const LIMIT = 5;

export function LowStockTable() {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedItem, setSelectedItem] = useState<LowStockRow | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const allRows = useLiveQuery(() => dashboardService.getLowStock(), []);
    const loading = allRows === undefined;

    const displayData = (allRows ?? []).slice(0, LIMIT);
    const hasMore = (allRows?.length ?? 0) > LIMIT;

    const handleOpenStockIn = (item: LowStockRow) => {
        setSelectedItem(item);
        open();
    };

    const handleSubmit = async (values: StockInFormValues) => {
        setSubmitLoading(true);
        try {
            await stockService.createStockEntry({
                productId: values.productId as string,
                variantId: values.variantId ?? null,
                quantity: typeof values.quantity === 'number' ? values.quantity : 0,
                unitCost: typeof values.unitCost === 'number' ? values.unitCost : 0,
                supplier: values.supplier.trim(),
                source: values.source,
                receivedAt: new Date(values.receivedAt).toISOString(),
                createdBy: 'system',
            });
            close();
        } catch (error) {
            console.error('Gagal menyimpan stock in:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: Column<LowStockRow>[] = [
        {
            id: 'name',
            label: 'Nama Produk',
            width: 180,
            render: (row) => (
                <Text size="sm" fw={500} lineClamp={1} title={row.name}>
                    {row.name}
                </Text>
            ),
        },
        {
            id: 'sku',
            label: 'SKU',
            width: 110,
            render: (row) => (
                <Text size="xs" ff="monospace" c="dimmed">
                    {row.sku}
                </Text>
            ),
        },
        {
            id: 'stock',
            label: 'Stok Sisa',
            width: 85,
            align: 'center',
            render: (row) =>
                row.stock === 0 ? (
                    <Badge color="red" variant="filled" size="sm">
                        Habis
                    </Badge>
                ) : (
                    <Text size="sm" fw={700} c="orange">
                        {row.stock}
                    </Text>
                ),
        },
        {
            id: 'actions',
            label: 'Aksi',
            width: 65,
            align: 'center',
            render: (row) => (
                <Tooltip label="Stock In" withArrow position="left">
                    <ActionIcon variant="subtle" onClick={() => handleOpenStockIn(row)} aria-label="Stock In">
                        <IconPackageImport size={16} />
                    </ActionIcon>
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <Card withBorder shadow="none" p="md" radius="md" h="100%">
                <Group justify="space-between" align="flex-start" mb="xs">
                    <Title order={4}>Peringatan Stok Menipis</Title>
                    {hasMore && (
                        <Button
                            component={Link}
                            href="/products"
                            size="xs"
                            variant="subtle"
                            rightSection={<IconArrowRight size={14} />}
                        >
                            Lihat Semua ({allRows?.length})
                        </Button>
                    )}
                </Group>

                <DataTable
                    columns={columns}
                    data={displayData}
                    loading={loading}
                    getRowKey={(row) => row.key}
                    emptyText="Semua produk stoknya aman."
                    minWidth={440}
                />
            </Card>

            <Modal opened={opened} onClose={close} title={<Text fw={600}>Tambah Stok Masuk</Text>} size="lg">
                <StockInForm
                    key={selectedItem?.key}
                    initialProductId={selectedItem?.productId ?? null}
                    initialVariantId={selectedItem?.variantId ?? null}
                    onSubmit={handleSubmit}
                    loading={submitLoading}
                    onCancel={close}
                />
            </Modal>
        </>
    );
}
