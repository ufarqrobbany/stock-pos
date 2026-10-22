'use client';

import { BarChart } from '@mantine/charts';
import { Box, Card, Center, Group, Loader, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import type { DashboardPeriod } from '@/features/dashboard/utils/dashboardUtils';
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
                {value.toLocaleString('id-ID')} Transaksi
            </Text>
        </div>
    );
}

export interface TransactionChartProps {
    period?: DashboardPeriod;
}

export function TransactionChart({ period: propPeriod }: TransactionChartProps = {}) {
    const [internalPeriod] = useState<DashboardPeriod>('Minggu Ini');
    const period = propPeriod ?? internalPeriod;

    const data = useLiveQuery<TxChartItem[]>(() => {
        if (period === 'Minggu Ini') return dashboardService.getTxWeekly();
        if (period === 'Bulan Ini') return dashboardService.getTxThisMonth();
        return dashboardService.getTxThisYear();
    }, [period]);

    const loading = data === undefined;
    const isScrollable = period === 'Bulan Ini';
    const isEmpty = !loading && (!data || data.length === 0 || data.every((item) => item.transaksi <= 0));
    const totalTransaksi = data?.reduce((sum, item) => sum + (item.transaksi ?? 0), 0) ?? 0;

    const maxTransaksi = data?.reduce((max, item) => Math.max(max, item.transaksi ?? 0), 0) ?? 0;
    const formattedMaxTransaksi = `${maxTransaksi}`;
    const yAxisWidth = Math.max(36, Math.ceil(formattedMaxTransaksi.length * 8 + 20));

    const renderContent = () => {
        if (loading) {
            return (
                <Center h={240}>
                    <Loader size="md" color="primary" />
                </Center>
            );
        }

        if (isEmpty) {
            return (
                <Center h={240}>
                    <Text c="dimmed" size="sm">
                        Belum ada data transaksi
                    </Text>
                </Center>
            );
        }

        if (!isScrollable) {
            return (
                <BarChart
                    h={240}
                    data={data}
                    dataKey="label"
                    series={[{ name: 'transaksi', label: 'Transaksi', color: 'teal' }]}
                    maxBarWidth={32}
                    withLegend={false}
                    tooltipProps={{
                        content: ({ label, payload }) => (
                            <TxTooltip label={label} payload={payload as unknown as TooltipPayloadEntry[]} />
                        ),
                    }}
                    xAxisProps={{
                        padding: { left: 16, right: 16 },
                        tick: { fontSize: 12 },
                        interval: 0,
                        height: 30,
                    }}
                    yAxisProps={{
                        width: yAxisWidth,
                        tick: { fontSize: 11 },
                        allowDecimals: false,
                        domain: [0, 'auto'],
                    }}
                    valueFormatter={(val) => `${val}`}
                    barChartProps={{
                        margin: { top: 10, right: 16, left: 0, bottom: 0 },
                    }}
                />
            );
        }

        const scrollWidth = Math.max(data.length * 22, 500);

        return (
            <Box style={{ display: 'flex', width: '100%', position: 'relative' }}>
                {/* 1. Sticky Y-Axis (Fixed on the left) */}
                <Box
                    style={{
                        width: yAxisWidth,
                        flexShrink: 0,
                        backgroundColor: 'var(--mantine-color-white)',
                        zIndex: 2,
                    }}
                >
                    <BarChart
                        h={240}
                        w={yAxisWidth}
                        data={data}
                        dataKey="label"
                        series={[{ name: 'transaksi', label: 'Transaksi', color: 'transparent' }]}
                        fillOpacity={0}
                        maxBarWidth={0}
                        withTooltip={false}
                        withLegend={false}
                        withXAxis={true}
                        xAxisProps={{
                            tick: false,
                            tickLine: false,
                            axisLine: false,
                            height: 30,
                        }}
                        withYAxis={true}
                        yAxisProps={{
                            width: yAxisWidth,
                            tick: { fontSize: 11 },
                            allowDecimals: false,
                            domain: [0, 'auto'],
                        }}
                        gridAxis="none"
                        valueFormatter={(val) => `${val}`}
                        barChartProps={{
                            margin: { top: 10, right: 0, left: 0, bottom: 0 },
                        }}
                        style={{ pointerEvents: 'none' }}
                    />
                </Box>

                {/* 2. Scrollable Graph Area (Scrolls horizontally on the right) */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                    <ScrollArea type="scroll" scrollbarSize={6} offsetScrollbars>
                        <Box style={{ width: scrollWidth }}>
                            <BarChart
                                h={240}
                                w={scrollWidth}
                                data={data}
                                dataKey="label"
                                series={[{ name: 'transaksi', label: 'Transaksi', color: 'teal' }]}
                                maxBarWidth={14}
                                withLegend={false}
                                withXAxis={true}
                                withYAxis={false}
                                xAxisProps={{
                                    padding: { left: 16, right: 16 },
                                    tick: { fontSize: 10 },
                                    interval: 0,
                                    height: 30,
                                }}
                                yAxisProps={{
                                    allowDecimals: false,
                                    domain: [0, 'auto'],
                                }}
                                tooltipProps={{
                                    content: ({ label, payload }) => (
                                        <TxTooltip
                                            label={label}
                                            payload={payload as unknown as TooltipPayloadEntry[]}
                                        />
                                    ),
                                }}
                                valueFormatter={(val) => `${val}`}
                                barChartProps={{
                                    margin: { top: 10, right: 16, left: 0, bottom: 0 },
                                }}
                            />
                        </Box>
                    </ScrollArea>
                </Box>
            </Box>
        );
    };

    return (
        <Card withBorder shadow="none" p="md" radius="md">
            <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
                <Stack gap={2}>
                    <Title order={4}>Jumlah Transaksi</Title>
                </Stack>
                <Stack gap={0} align="flex-end" justify="center" h={28}>
                    {loading ? (
                        <Loader size="xs" color="primary" />
                    ) : (
                        <Text size="lg" fw={700} c="teal">
                            {totalTransaksi.toLocaleString('id-ID')} Transaksi
                        </Text>
                    )}
                </Stack>
            </Group>

            {renderContent()}
        </Card>
    );
}
