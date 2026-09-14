'use client';

import { ActionIcon, Box, Group, NavLink, Stack, Text, Title } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconLogout, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './index.module.css';
import { sidebarRoutes } from './routes';

interface MainSidebarProps {
    isCompact: boolean;
    toggleCompact: () => void;
    onClose?: () => void;
    onLogout?: () => void;
}

export function MainSidebar({ isCompact, toggleCompact, onClose, onLogout }: MainSidebarProps) {
    const pathname = usePathname();

    return (
        <Box h="100%" style={{ position: 'relative' }}>
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
                        {sidebarRoutes.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.link);

                            if (isCompact) {
                                return (
                                    <ActionIcon
                                        key={item.link}
                                        component={Link}
                                        href={item.link}
                                        size={42}
                                        data-active={isActive || undefined}
                                        className={classes.miniIconBtn}
                                    >
                                        <Icon size={20} stroke={1.5} />
                                    </ActionIcon>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.link}
                                    component={Link}
                                    href={item.link}
                                    label={item.label}
                                    leftSection={<Icon size={20} stroke={1.5} />}
                                    active={isActive}
                                    className={classes.navLink}
                                />
                            );
                        })}
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
