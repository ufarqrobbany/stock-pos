'use client';

import { LineChart } from '@mantine/charts';
import { Box, Card, Center, Group, Loader, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { dashboardService } from '@/features/dashboard/services/dashboardService';
import type { SalesChartItem } from '../types';
import type { DashboardPeriod } from '../utils/dashboardUtils';

interface RechartsPayloadEntry {
    value: number | null;
    name: string;
    payload: SalesChartItem;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function CustomTooltip({ label, payload }: { label?: string | number; payload?: RechartsPayloadEntry[] }) {
    if (!payload?.length) return null;
    const entry = payload[0];
    const value = entry?.value;
    const tanggal = entry?.payload?.tanggal;
    if (value === undefined || value === null || !tanggal) return null;

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid var(--mantine-color-default-border)',
                borderRadius: 8,
                padding: '8px 12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                minWidth: 180,
            }}
        >
            <Text size="xs" fw={700} mb={2}>
                {label}
            </Text>
            <Text size="xs" c="dimmed" mb={4}>
                {tanggal}
            </Text>
            <Text size="sm" fw={700} c="blue">
                {formatRupiah(value)}
            </Text>
        </div>
    );
}

export interface SalesChartProps {
    period?: DashboardPeriod;
}

export function SalesChart({ period: propPeriod }: SalesChartProps = {}) {
    const [internalPeriod] = useState<DashboardPeriod>('Minggu Ini');
    const period = propPeriod ?? internalPeriod;

    const data = useLiveQuery<SalesChartItem[]>(() => {
        if (period === 'Minggu Ini') return dashboardService.getSalesWeekly();
        if (period === 'Bulan Ini') return dashboardService.getSalesThisMonth();
        return dashboardService.getSalesThisYear();
    }, [period]);

    const loading = data === undefined;
    const isScrollable = period === 'Bulan Ini';
    const isEmpty = !loading && (!data || data.length === 0 || data.every((item) => (item.penjualan ?? 0) <= 0));
    const totalPenjualan = data?.reduce((sum, item) => sum + (item.penjualan ?? 0), 0) ?? 0;

    const maxPenjualan = data?.reduce((max, item) => Math.max(max, item.penjualan ?? 0), 0) ?? 0;
    const formattedMaxPenjualan = formatRupiah(maxPenjualan);
    const yAxisWidth = Math.max(64, Math.ceil(formattedMaxPenjualan.length * 7.5 + 18));

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
                        Belum ada data penjualan
                    </Text>
                </Center>
            );
        }

        if (!isScrollable) {
            return (
                <LineChart
                    h={240}
                    data={data}
                    dataKey="label"
                    series={[{ name: 'penjualan', label: 'Penjualan', color: 'blue' }]}
                    curveType="monotone"
                    connectNulls={false}
                    withDots={true}
                    withLegend={false}
                    tooltipProps={{
                        content: ({ label, payload }) => (
                            <CustomTooltip label={label} payload={payload as unknown as RechartsPayloadEntry[]} />
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
                        domain: [0, 'auto'],
                    }}
                    lineChartProps={{
                        margin: { top: 10, right: 16, left: 0, bottom: 0 },
                    }}
                    valueFormatter={(val) => formatRupiah(val)}
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
                    <LineChart
                        h={240}
                        w={yAxisWidth}
                        data={data}
                        dataKey="label"
                        series={[{ name: 'penjualan', label: 'Penjualan', color: 'transparent' }]}
                        curveType="monotone"
                        strokeWidth={0}
                        fillOpacity={0}
                        connectNulls={false}
                        withDots={false}
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
                            domain: [0, 'auto'],
                        }}
                        gridAxis="none"
                        valueFormatter={(val) => formatRupiah(val)}
                        lineChartProps={{
                            margin: { top: 10, right: 0, left: 0, bottom: 0 },
                        }}
                        style={{ pointerEvents: 'none' }}
                    />
                </Box>

                {/* 2. Scrollable Graph Area (Scrolls horizontally on the right) */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                    <ScrollArea type="scroll" scrollbarSize={6} offsetScrollbars>
                        <Box style={{ width: scrollWidth }}>
                            <LineChart
                                h={240}
                                w={scrollWidth}
                                data={data}
                                dataKey="label"
                                series={[{ name: 'penjualan', label: 'Penjualan', color: 'blue' }]}
                                curveType="monotone"
                                connectNulls={false}
                                withDots={false}
                                withTooltip={true}
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
                                    domain: [0, 'auto'],
                                }}
                                tooltipProps={{
                                    content: ({ label, payload }) => (
                                        <CustomTooltip
                                            label={label}
                                            payload={payload as unknown as RechartsPayloadEntry[]}
                                        />
                                    ),
                                }}
                                valueFormatter={(val) => formatRupiah(val)}
                                lineChartProps={{
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
                    <Title order={4}>Total Penjualan (Rp)</Title>
                </Stack>
                <Stack gap={0} align="flex-end" justify="center" h={28}>
                    {loading ? (
                        <Loader size="xs" color="primary" />
                    ) : (
                        <Text size="lg" fw={700} c="blue">
                            {formatRupiah(totalPenjualan)}
                        </Text>
                    )}
                </Stack>
            </Group>

            {renderContent()}
        </Card>
    );
}
