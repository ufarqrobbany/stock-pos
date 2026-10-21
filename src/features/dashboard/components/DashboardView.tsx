'use client';

import { Box, Button, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconSparkles } from '@tabler/icons-react';
import { AIChatbotSidebar } from './AIChatbotSidebar';
import { LowStockTable } from './LowStockTable';
import { MetricsCards } from './MetricsCards';
import { RecentTransactionsTable } from './RecentTransactionsTable';
import { SalesChart } from './SalesChart';
import { TopProductsTable } from './TopProductsTable';
import { TransactionChart } from './TransactionChart';

export function DashboardView() {
    const theme = useMantineTheme();
    const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
    const [isChatbotOpen, { close: closeChatbot, open: openChatbot }] = useDisclosure(false);

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
                            size="sm"
                            bd="1px solid var(--mantine-color-surface-2)"
                            leftSection={<IconSparkles size={16} color="var(--mantine-color-primary-6)" />}
                            onClick={openChatbot}
                        >
                            Tanya AI
                        </Button>
                    )}
                </Group>

                <Stack gap="md">
                    <MetricsCards />
                    <SalesChart />
                    <TransactionChart />
                    <LowStockTable />
                    <TopProductsTable />
                    <RecentTransactionsTable />
                </Stack>
            </Stack>

            <AIChatbotSidebar opened={isChatbotOpen} onClose={closeChatbot} />
        </Box>
    );
}
