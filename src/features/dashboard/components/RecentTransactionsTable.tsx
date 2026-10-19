'use client';

import { Badge, Card, Table, Text, Title } from '@mantine/core';

const dummyTransactions = [
    { id: 'TRX-001', time: '16:20 - 19 Okt 2026', total: 'Rp45.000', method: 'QRIS', status: 'COMPLETED' },
    { id: 'TRX-002', time: '15:45 - 19 Okt 2026', total: 'Rp120.000', method: 'CASH', status: 'COMPLETED' },
    { id: 'TRX-003', time: '14:10 - 19 Okt 2026', total: 'Rp85.000', method: 'TRANSFER', status: 'COMPLETED' },
];

export function RecentTransactionsTable() {
    return (
        <Card withBorder p="md" radius="md">
            <Title order={4} mb="xs">
                Transaksi Terakhir
            </Title>
            <Text size="xs" c="dimmed" mb="md">
                Daftar transaksi penjualan kasir yang baru masuk.
            </Text>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>No. Transaksi</Table.Th>
                        <Table.Th>Waktu</Table.Th>
                        <Table.Th>Metode</Table.Th>
                        <Table.Th>Total</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {dummyTransactions.map((trx) => (
                        <Table.Tr key={trx.id}>
                            <Table.Td fw={500}>{trx.id}</Table.Td>
                            <Table.Td>{trx.time}</Table.Td>
                            <Table.Td>{trx.method}</Table.Td>
                            <Table.Td fw={600}>{trx.total}</Table.Td>
                            <Table.Td>
                                <Badge color="green" variant="light" size="sm">
                                    {trx.status}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Card>
    );
}
