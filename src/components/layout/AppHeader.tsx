'use client';

import { ActionIcon, Avatar, Burger, Group, Stack, Text } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

interface AppHeaderProps {
    opened: boolean;
    toggleMobile: () => void;
}

export function AppHeader({ opened, toggleMobile }: AppHeaderProps) {
    return (
        <Group h="100%" px="md" justify="space-between">
            <Group>
                <Burger opened={opened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            </Group>

            <Group gap="xl">
                <Group gap="sm">
                    <Avatar color="primary" radius="xl" size="md">
                        U
                    </Avatar>
                    <Stack gap={0}>
                        <Text size="sm" fw={600}>
                            Username
                        </Text>
                        <Text size="xs" c="neutral.4">
                            Role
                        </Text>
                    </Stack>
                </Group>

                <ActionIcon variant="light" color="red" size="lg" title="Keluar">
                    <IconLogout size={16} />
                </ActionIcon>
            </Group>
        </Group>
    );
}
