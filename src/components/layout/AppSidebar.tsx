'use client';

import { ActionIcon, Box, NavLink, Stack, Text, Title } from '@mantine/core';
import {
    IconBox,
    IconChevronLeft,
    IconChevronRight,
    IconDashboard,
    IconReceipt,
    IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './AppSidebar.module.css';

interface AppSidebarProps {
    isMini: boolean;
    toggleMini: () => void;
    onNavigate?: () => void;
}

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: IconDashboard },
    { label: 'Katalog Produk', href: '/products', icon: IconBox },
    { label: 'Riwayat Transaksi', href: '/transactions', icon: IconReceipt },
    { label: 'Manajemen Pengguna', href: '/users', icon: IconUsers },
];

export function AppSidebar({ isMini, toggleMini, onNavigate }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <Box h="100%" style={{ position: 'relative' }}>
            <ActionIcon
                onClick={toggleMini}
                size={24}
                radius="xl"
                variant="filled"
                color="neutral.8"
                visibleFrom="sm"
                bd="1px solid rgba(255, 255, 255, 0.15)"
                top={4}
                right={-28}
                style={{
                    position: 'absolute',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                    zIndex: 102,
                }}
            >
                {isMini ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
            </ActionIcon>

            <Stack justify="space-between" h="100%">
                <Box>
                    <Box h={50} px={'xs'} mb="md">
                        <Title order={3} fw={800} fz={isMini ? 20 : 24} c="primary.6">
                            <Text span fw={800} fz={20} c="white">
                                {isMini ? 'S' : 'Stock'}
                            </Text>
                            {isMini ? 'P' : 'POS'}
                        </Title>
                    </Box>

                    <Stack gap={5}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);

                            if (isMini) {
                                return (
                                    <ActionIcon
                                        key={item.href}
                                        component={Link}
                                        href={item.href}
                                        onClick={onNavigate}
                                        size={42}
                                        radius="md"
                                        variant="subtle"
                                        data-active={isActive || undefined}
                                        className={classes.miniIconBtn}
                                    >
                                        <Icon size={20} stroke={1.5} />
                                    </ActionIcon>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.href}
                                    component={Link}
                                    href={item.href}
                                    label={item.label}
                                    leftSection={<Icon size={20} stroke={1.5} />}
                                    active={isActive}
                                    onClick={onNavigate}
                                    className={classes.navLink}
                                />
                            );
                        })}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
}
