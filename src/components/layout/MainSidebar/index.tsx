'use client';

import { ActionIcon, Box, Group, NavLink, Stack, Text, Title } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconLogout, IconX } from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/db/types/user';
import classes from './index.module.css';
import { sidebarRoutes } from './routes';
import { SidebarItem } from './SidebarItem';

interface MainSidebarProps {
    isCompact: boolean;
    toggleCompact: () => void;
    onClose?: () => void;
    onLogout?: () => void;
    userRole?: UserRole;
}

export function MainSidebar({ isCompact, toggleCompact, onClose, onLogout, userRole }: MainSidebarProps) {
    const pathname = usePathname();

    const visibleRoutes = sidebarRoutes
        .filter((item) => (userRole ? item.allowedRoles.includes(userRole) : false))
        .map((item) => ({
            ...item,
            children: item.children?.filter((c) => (userRole ? c.allowedRoles.includes(userRole) : false)),
        }));

    return (
        <Box h="100%" pos="relative">
            <ActionIcon onClick={toggleCompact} visibleFrom="sm" className={classes.toggleCompactBtn}>
                {isCompact ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
            </ActionIcon>

            <Stack justify="space-between" h="100%">
                <Box>
                    <Group h={50} px="xs" mb="md" justify="space-between" wrap="nowrap">
                        <Title order={3} fw={800} fz={isCompact ? 20 : 24} c="primary.6">
                            <Text span fw={800} fz={20} c="white">
                                {isCompact ? 'S' : 'Stock'}
                            </Text>
                            {isCompact ? 'P' : 'POS'}
                        </Title>
                        <ActionIcon onClick={onClose} variant="subtle" color="neutral.3" hiddenFrom="sm">
                            <IconX size={20} stroke={1.5} />
                        </ActionIcon>
                    </Group>

                    <Stack gap={5}>
                        {visibleRoutes.map((item) => (
                            <SidebarItem
                                key={item.link ?? item.label}
                                item={item}
                                pathname={pathname}
                                isCompact={isCompact}
                            />
                        ))}
                    </Stack>
                </Box>

                <Box>
                    {isCompact ? (
                        <ActionIcon onClick={onLogout} size={42} className={classes.logoutMiniBtn}>
                            <IconLogout size={20} stroke={1.5} />
                        </ActionIcon>
                    ) : (
                        <NavLink
                            label="Keluar"
                            leftSection={<IconLogout size={20} stroke={1.5} />}
                            onClick={onLogout}
                            className={classes.logoutBtn}
                        />
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
