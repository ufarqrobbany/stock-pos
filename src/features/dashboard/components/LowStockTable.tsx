'use client';

import { Badge, Button, Card, Group, Modal, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowRight, IconPackageImport } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import type { Column } from '@/components/common/DataTable/types';
import type { LowStockRow } from '@/db/repositories/dashboardRepository';
import { dashboardRepository } from '@/features/dashboard/services/dashboardService';
import { StockInForm, type StockInFormValues } from '@/features/inventory/components/stockInForm';
import { stockService } from '@/features/inventory/services/stockService';

const LIMIT = 5;

export function LowStockTable() {
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedItem, setSelectedItem] = useState<LowStockRow | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const allRows = useLiveQuery(() => dashboardRepository.getLowStock(), []);
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
            render: (row) => (
                <Text size="sm" fw={500}>
                    {row.name}
                </Text>
            ),
        },
        {
            id: 'sku',
            label: 'SKU',
            width: 150,
            render: (row) => (
                <Text size="xs" ff="monospace" c="dimmed">
                    {row.sku}
                </Text>
            ),
        },
        {
            id: 'stock',
            label: 'Stok Sisa',
            width: 120,
            align: 'center',
            render: (row) =>
                row.stock === 0 ? (
                    <Badge color="red" variant="filled" size="sm">
                        Habis
                    </Badge>
                ) : (
                    <Stack gap={0} align="center">
                        <Text size="sm" fw={700} c="orange">
                            {row.stock}
                        </Text>
                        <Text size="xs" c="dimmed">
                            min. {row.threshold}
                        </Text>
                    </Stack>
                ),
        },
        {
            id: 'aksi',
            label: 'Aksi',
            width: 130,
            align: 'center',
            render: (row) => (
                <Button
                    size="xs"
                    variant="light"
                    color="blue"
                    leftSection={<IconPackageImport size={14} />}
                    onClick={() => handleOpenStockIn(row)}
                >
                    Stock In
                </Button>
            ),
        },
    ];

    return (
        <>
            <Card withBorder shadow="none" p="md" radius="md">
                <Group justify="space-between" align="flex-start" mb="xs">
                    <Stack gap={2}>
                        <Title order={4}>Peringatan Stok Menipis</Title>
                        <Text size="xs" c="dimmed">
                            Produk yang berada di bawah batas minimum stok.
                        </Text>
                    </Stack>
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

                {loading ? (
                    <Stack gap="xs">
                        {['skeleton-0', 'skeleton-1', 'skeleton-2'].map((skeletonKey) => (
                            <Skeleton key={skeletonKey} height={40} radius="sm" />
                        ))}
                    </Stack>
                ) : (
                    <DataTable
                        columns={columns}
                        data={displayData}
                        getRowKey={(row) => row.key}
                        emptyText="Semua produk stoknya aman."
                    />
                )}
            </Card>

            <Modal
                opened={opened}
                onClose={close}
                title={
                    <Stack gap={2}>
                        <Text fw={600}>Tambah Stok Masuk</Text>
                        {selectedItem && (
                            <Text size="xs" c="dimmed">
                                {selectedItem.name}
                            </Text>
                        )}
                    </Stack>
                }
                size="lg"
            >
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
