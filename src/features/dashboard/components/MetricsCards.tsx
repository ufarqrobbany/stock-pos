'use client';

import { Card, Group, SimpleGrid, Skeleton, Text } from '@mantine/core';
import { IconBoxSeam, IconCash, IconReceipt } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { ReactNode } from 'react';
import { dashboardRepository } from '@/features/dashboard/services/dashboardService';

interface MetricCardProps {
    label: string;
    value: string;
    icon: ReactNode;
    subtext?: string;
    subtextColor?: string;
    loading?: boolean;
}

function MetricCard({ label, value, icon, subtext, subtextColor = 'dimmed', loading }: MetricCardProps) {
    return (
        <Card withBorder shadow="none" p="md" radius="md">
            <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {label}
                </Text>
                {icon}
            </Group>
            {loading ? (
                <>
                    <Skeleton height={28} mt="sm" width="60%" radius="sm" />
                    <Skeleton height={14} mt={6} width="80%" radius="sm" />
                </>
            ) : (
                <>
                    <Text fw={700} fz="xl" mt="sm">
                        {value}
                    </Text>
                    {subtext && (
                        <Text size="xs" c={subtextColor} mt={4}>
                            {subtext}
                        </Text>
                    )}
                </>
            )}
        </Card>
    );
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(amount);
}

function getSalesSubtext(today: number, yesterday: number): { text: string; color: string } {
    if (yesterday === 0) {
        return today > 0
            ? { text: 'Tidak ada data kemarin', color: 'dimmed' }
            : { text: 'Belum ada transaksi hari ini', color: 'dimmed' };
    }
    const diff = ((today - yesterday) / yesterday) * 100;
    const sign = diff >= 0 ? '+' : '';
    const color = diff >= 0 ? 'green' : 'red';
    return { text: `${sign}${diff.toFixed(1)}% dibanding kemarin`, color };
}

export function MetricsCards() {
    const metrics = useLiveQuery(() => dashboardRepository.getMetrics(), []);
    const loading = metrics === undefined;

    const salesSubtext = metrics
        ? getSalesSubtext(metrics.salesToday, metrics.salesYesterday)
        : { text: '', color: 'dimmed' };

    return (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <MetricCard
                label="Total Penjualan Hari Ini"
                value={loading ? '' : formatRupiah(metrics!.salesToday)}
                icon={<IconCash size={20} color="var(--mantine-color-blue-6)" />}
                subtext={salesSubtext.text}
                subtextColor={salesSubtext.color}
                loading={loading}
            />
            <MetricCard
                label="Total Transaksi Hari Ini"
                value={loading ? '' : `${metrics!.transactionsToday} Transaksi`}
                icon={<IconReceipt size={20} color="var(--mantine-color-teal-6)" />}
                loading={loading}
            />
            <MetricCard
                label="Unit Terjual Hari Ini"
                value={loading ? '' : `${metrics!.unitsSoldToday} Unit`}
                icon={<IconBoxSeam size={20} color="var(--mantine-color-red-6)" />}
                loading={loading}
            />
        </SimpleGrid>
    );
}
