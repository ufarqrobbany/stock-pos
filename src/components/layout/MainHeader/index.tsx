import { Avatar, Burger, Group, Stack, Text } from '@mantine/core';
import type { User } from '@/db/types/user';

interface MainHeaderProps {
    sidebarOpened: boolean;
    toggleSidebar: () => void;
    user?: User | null;
}

export function MainHeader({ sidebarOpened, toggleSidebar, user }: MainHeaderProps) {
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'P';

    return (
        <Group h="100%" px="md" justify="flex-end">
            <Burger opened={sidebarOpened} onClick={toggleSidebar} hiddenFrom="sm" size="sm" mr="auto" />
            <Group gap="sm">
                <Stack gap={0} align="flex-end">
                    <Text size="sm" fw={600}>
                        {user?.name || 'Pengguna'}
                    </Text>
                    <Text size="xs" c="neutral.4">
                        {user?.role || 'Role'}
                    </Text>
                </Stack>
                <Avatar color="primary" radius="xl" size="md">
                    {initial}
                </Avatar>
            </Group>
        </Group>
    );
}
