'use client';

import { Box, Button, Group, SegmentedControl, SimpleGrid, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import { DASHBOARD_PERIODS, type DashboardPeriod, getPeriodLabel } from '../utils/dashboardUtils';
import { AIChatbotSidebar } from './AIChatbotSidebar';
import classes from './DashboardView.module.css';
import { LowStockTable } from './LowStockTable';
import { MetricsCards } from './MetricsCards';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { SalesChart } from './SalesChart';
import { TransactionChart } from './TransactionChart';

export function DashboardView() {
    const theme = useMantineTheme();
    const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const [isChatbotOpen, { close: closeChatbot, open: openChatbot }] = useDisclosure(false);
    const [period, setPeriod] = useState<DashboardPeriod>('Minggu Ini');

    return (
        <Box
            p="xl"
            mr={isChatbotOpen && isDesktop ? 380 : 0}
            style={{
                transition: 'margin-right 250ms ease',
            }}
        >
            <Stack gap="lg">
                <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                    <Stack gap={2}>
                        <Title order={2}>Dashboard Analitik</Title>
                        <Text c="neutral.4" size="sm">
                            Ringkasan aktivitas penjualan dan pemantauan inventaris toko.
                        </Text>
                    </Stack>

                    {!isChatbotOpen && (
                        <Button
                            variant="default"
                            size="md"
                            bd="1px solid var(--mantine-color-surface-2)"
                            leftSection={<IconSparkles size={16} color="var(--mantine-color-primary-6)" />}
                            onClick={openChatbot}
                        >
                            Tanya AI
                        </Button>
                    )}
                </Group>

                <Stack gap="lg">
                    <MetricsCards />

                    <Stack gap="md">
                        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                            <Title order={3} fz="md" fw={600}>
                                Tren Penjualan
                            </Title>
                            <Group gap="sm" align="center" wrap="wrap">
                                <Text size="xs" c="neutral.4">
                                    {getPeriodLabel(period)}
                                </Text>
                                <SegmentedControl
                                    size="xs"
                                    radius="md"
                                    color="primary"
                                    autoContrast
                                    withItemsBorders={false}
                                    data={DASHBOARD_PERIODS}
                                    value={period}
                                    onChange={(val) => setPeriod(val as DashboardPeriod)}
                                    classNames={{
                                        root: classes.segmentedRoot,
                                        indicator: classes.segmentedIndicator,
                                        label: classes.segmentedLabel,
                                    }}
                                />
                            </Group>
                        </Group>

                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                            <SalesChart period={period} />
                            <TransactionChart period={period} />
                        </SimpleGrid>
                    </Stack>

                    <Stack gap="md">
                        <Title order={3} fz="md" fw={600}>
                            Aktivitas Terkini
                        </Title>
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                            <LowStockTable />
                            <RecentTransactionsTable />
                        </SimpleGrid>
                    </Stack>
                </Stack>
            </Stack>

            <AIChatbotSidebar opened={isChatbotOpen} onClose={closeChatbot} />
        </Box>
    );
}
