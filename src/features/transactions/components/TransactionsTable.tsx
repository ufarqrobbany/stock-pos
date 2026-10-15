'use client';

import { ActionIcon, Badge, Card, Group, Modal, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { db } from '@/db';
import type { SalesTransaction, SalesTransactionItem } from '@/db/types/sales';
import { useTransactionContext } from '../context/TransactionContext';
import { createTransactionColumns } from './TransactionsColumns';

export function TransactionsTable() {
    const { transactions, isLoading, search, setSearch, pagination } = useTransactionContext();

    const [opened, setOpened] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<SalesTransaction | null>(null);
    const [transactionItems, setTransactionItems] = useState<SalesTransactionItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const handleViewItems = async (transaction: SalesTransaction) => {
        setSelectedTransaction(transaction);
        setOpened(true);
        setLoadingItems(true);
        try {
            const items = await db.salesTransactionItems.where('transactionId').equals(transaction.id).toArray();
            setTransactionItems(items);
        } catch (error) {
            console.error('Gagal memuat detail item transaksi:', error);
        } finally {
            setLoadingItems(false);
        }
    };

    const columns = createTransactionColumns({ onViewItems: handleViewItems });

    return (
        <Stack gap="md" p="xl">
            <div>
                <Title order={2}>Riwayat Transaksi</Title>
                <Text c="neutral.4" size="sm">
                    Daftar seluruh transaksi penjualan yang berhasil diproses.
                </Text>
            </div>

            <Card withBorder p="md" radius="md">
                <Group justify="space-between" align="center" mb="md">
                    <TextInput
                        w={300}
                        placeholder="Cari No. Transaksi atau Pelanggan..."
                        leftSection={<IconSearch size={16} />}
                        rightSection={
                            search ? (
                                <ActionIcon variant="subtle" color="neutral" size="sm" onClick={() => setSearch('')}>
                                    <IconX size={14} />
                                </ActionIcon>
                            ) : null
                        }
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                    />
                    <Badge variant="light" color="blue">
                        {pagination.total} TRANSAKSI DITEMUKAN
                    </Badge>
                </Group>

                <DataTable
                    columns={columns}
                    data={transactions}
                    loading={isLoading}
                    getRowKey={(item) => item.id}
                    emptyText="Belum ada riwayat transaksi."
                    pagination={pagination}
                />
            </Card>

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title={<Text fw={700}>Detail Produk - {selectedTransaction?.transactionNumber}</Text>}
                size="lg"
            >
                {loadingItems ? (
                    <Text ta="center" py="md">
                        Memuat detail produk...
                    </Text>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Nama Produk</Table.Th>
                                <Table.Th>Harga Satuan</Table.Th>
                                <Table.Th>Qty</Table.Th>
                                <Table.Th>Subtotal</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {transactionItems.length > 0 ? (
                                transactionItems.map((item) => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td>
                                            {item.productNameSnapshot}
                                            {item.variantNameSnapshot && (
                                                <Text size="xs" c="dimmed">
                                                    {item.variantNameSnapshot}
                                                </Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>Rp{item.unitPrice.toLocaleString('id-ID')}</Table.Td>
                                        <Table.Td>{item.quantity}</Table.Td>
                                        <Table.Td>Rp{item.subtotal.toLocaleString('id-ID')}</Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={4} ta="center">
                                        Tidak ada produk dalam transaksi ini.
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                )}
            </Modal>
        </Stack>
    );
}
