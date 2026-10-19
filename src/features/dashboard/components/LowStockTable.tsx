'use client';

import { Badge, Card, Table, Text, Title } from '@mantine/core';

const dummyLowStock = [
    { id: '1', name: 'Minyak Goreng Bimoli 1L', stock: 3, category: 'Sembako' },
    { id: '2', name: 'Susu Ultra Milk Cokelat 250ml', stock: 2, category: 'Minuman' },
    { id: '3', name: 'Indomie Goreng Special', stock: 5, category: 'Makanan Instan' },
];

export function LowStockTable() {
    return (
        <Card withBorder p="md" radius="md">
            <Title order={4} mb="xs">
                Peringatan Stok Menipis
            </Title>
            <Text size="xs" c="dimmed" mb="md">
                Produk yang berada di bawah batas minimum stok.
            </Text>

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Nama Produk</Table.Th>
                        <Table.Th>Kategori</Table.Th>
                        <Table.Th>Stok Sisa</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {dummyLowStock.map((item) => (
                        <Table.Tr key={item.id}>
                            <Table.Td fw={500}>{item.name}</Table.Td>
                            <Table.Td>{item.category}</Table.Td>
                            <Table.Td fw={700} c="red">
                                {item.stock}
                            </Table.Td>
                            <Table.Td>
                                <Badge color="red" variant="light" size="sm">
                                    Kritis
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Card>
    );
}
