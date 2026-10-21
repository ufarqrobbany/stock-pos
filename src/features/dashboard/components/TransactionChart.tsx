'use client';

import { LineChart } from '@mantine/charts';
import { Card, Group, ScrollArea, SegmentedControl, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import type { DashboardPeriod } from '@/features/dashboard/utils/dashboardUtils';
import { DASHBOARD_PERIODS, getPeriodLabel } from '@/features/dashboard/utils/dashboardUtils';
import type { TxChartItem } from '../types';

interface TooltipPayloadEntry {
    value: number;
    name: string;
    payload: TxChartItem;
}

function TxTooltip({ label, payload }: { label?: string | number; payload?: TooltipPayloadEntry[] }) {
    if (!payload?.length) return null;
    const entry = payload[0];
    const value = entry?.value;
    const tanggal = entry?.payload?.tanggal;
    if (value === undefined || !tanggal) return null;

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid var(--mantine-color-default-border)',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                minWidth: 160,
            }}
        >
            <Text size="xs" fw={700} mb={2}>
                {label}
            </Text>
            <Text size="xs" c="dimmed" mb={4}>
                {tanggal}
            </Text>
            <Text size="sm" fw={700} c="teal">
                {value} transaksi
            </Text>
        </div>
    );
}

export function TransactionChart() {
    const [period, setPeriod] = useState<DashboardPeriod>('Minggu Ini');

    const data = useLiveQuery<TxChartItem[]>(() => {
        if (period === 'Minggu Ini') return dashboardService.getTxWeekly();
        if (period === 'Bulan Ini') return dashboardService.getTxThisMonth();
        return dashboardService.getTxThisYear();
    }, [period]);

    const loading = data === undefined;
    const periodLabel = getPeriodLabel(period);
    const isScrollable = period === 'Bulan Ini';

    const chart = loading ? (
        <Skeleton height={240} radius="sm" />
    ) : (
        <LineChart
            h={240}
            w={isScrollable ? data.length * 44 : undefined}
            data={data}
            dataKey="label"
            series={[{ name: 'transaksi', label: 'Transaksi', color: 'teal' }]}
            curveType="monotone"
            withDots={!isScrollable}
            withLegend={false}
            tooltipProps={{
                content: ({ label, payload }) => (
                    <TxTooltip label={label} payload={payload as unknown as TooltipPayloadEntry[]} />
                ),
            }}
            xAxisProps={{
                padding: { left: 16, right: 16 },
                tick: { fontSize: isScrollable ? 10 : 12 },
                interval: 0,
            }}
            yAxisProps={{ tick: { fontSize: 11 }, allowDecimals: false }}
            valueFormatter={(val) => `${val} tx`}
        />
    );

    return (
        <Card withBorder shadow="none" p="md" radius="md">
            <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
                <Stack gap={2}>
                    <Title order={4}>Grafik Tren Transaksi</Title>
                    <Text size="xs" c="dimmed">
                        Periode: {periodLabel}
                    </Text>
                </Stack>
                <SegmentedControl
                    size="xs"
                    data={DASHBOARD_PERIODS}
                    value={period}
                    onChange={(val) => setPeriod(val as DashboardPeriod)}
                />
            </Group>

            {isScrollable && !loading ? (
                <ScrollArea type="scroll" scrollbarSize={6} offsetScrollbars>
                    {chart}
                </ScrollArea>
            ) : (
                chart
            )}
        </Card>
    );
}
