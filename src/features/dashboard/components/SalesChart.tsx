'use client';

import { Card, Group, SegmentedControl, Text, Title } from '@mantine/core';

const MONTH_DATA = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 65 },
    { month: 'Mar', value: 45 },
    { month: 'Apr', value: 80 },
    { month: 'Mei', value: 55 },
    { month: 'Jun', value: 95 },
    { month: 'Jul', value: 70 },
    { month: 'Agu', value: 85 },
    { month: 'Sep', value: 60 },
    { month: 'Okt', value: 100 },
    { month: 'Nov', value: 75 },
    { month: 'Des', value: 90 },
];

export function SalesChart() {
    return (
        <Card withBorder p="md" radius="md">
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={4}>Grafik Tren Penjualan</Title>
                    <Text size="xs" c="dimmed">
                        Statistik pendapatan bulanan toko
                    </Text>
                </div>
                <SegmentedControl size="xs" data={['Mingguan', 'Bulanan', 'Tahunan']} defaultValue="Bulanan" />
            </Group>

            <div
                style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--mantine-color-default-border)',
                }}
            >
                {MONTH_DATA.map((item) => (
                    <div
                        key={item.month}
                        style={{
                            flex: 1,
                            height: '100%',
                            display: 'flex',
                            alignItems: 'flex-end',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: `${item.value}%`,
                                backgroundColor: 'var(--mantine-color-blue-filled)',
                                borderRadius: '4px 4px 0 0',
                                opacity: 0.85,
                            }}
                        />
                    </div>
                ))}
            </div>
            <Group justify="space-between" mt="xs">
                {MONTH_DATA.map((item) => (
                    <Text key={`label-${item.month}`} size="xs" c="dimmed" style={{ flex: 1, textAlign: 'center' }}>
                        {item.month}
                    </Text>
                ))}
            </Group>
        </Card>
    );
}
