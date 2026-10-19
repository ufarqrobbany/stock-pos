'use client';

import { Card, Group, SimpleGrid, Text } from '@mantine/core';
import { IconBoxSeam, IconCash, IconReceipt } from '@tabler/icons-react';

export function MetricsCards() {
    return (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Card withBorder p="md" radius="md">
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Total Penjualan
                    </Text>
                    <IconCash size={20} color="var(--mantine-color-blue-6)" />
                </Group>
                <Text fw={700} fz="xl" mt="sm">
                    Rp1.450.000
                </Text>
                <Text size="xs" c="green" mt={4}>
                    +12% dibanding kemarin
                </Text>
            </Card>

            <Card withBorder p="md" radius="md">
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Transaksi Berhasil
                    </Text>
                    <IconReceipt size={20} color="var(--mantine-color-teal-6)" />
                </Group>
                <Text fw={700} fz="xl" mt="sm">
                    28 Transaksi
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                    Rata-rata order Rp51.000
                </Text>
            </Card>

            <Card withBorder p="md" radius="md">
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        Stok Menipis
                    </Text>
                    <IconBoxSeam size={20} color="var(--mantine-color-red-6)" />
                </Group>
                <Text fw={700} fz="xl" mt="sm" c="red">
                    4 Produk
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                    Perlu segera restock
                </Text>
            </Card>
        </SimpleGrid>
    );
}
