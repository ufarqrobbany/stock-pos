'use client';

import { Grid, Stack, Text, Title } from '@mantine/core';
import { AiChatbotSidebar } from './AiChatbotSidebar';
import { LowStockTable } from './LowStockTable';
import { MetricsCards } from './MetricsCards';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { SalesChart } from './SalesChart';

export function DashboardView() {
    return (
        <Stack gap="md" p="xl">
            <div>
                <Title order={2}>Dashboard Analitik</Title>
                <Text c="neutral.4" size="sm">
                    Ringkasan aktivitas penjualan dan pemantauan inventaris toko.
                </Text>
            </div>

            <Grid>
                <Grid.Col span={{ base: 12, md: 9 }}>
                    <Stack gap="md">
                        <MetricsCards />
                        <SalesChart />
                        <LowStockTable />
                        <RecentTransactionsTable />
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 3 }}>
                    <AiChatbotSidebar />
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
