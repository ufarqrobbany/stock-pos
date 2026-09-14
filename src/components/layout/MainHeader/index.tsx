import { Avatar, Burger, Group, Stack, Text } from '@mantine/core';

interface MainHeaderProps {
    sidebarOpened: boolean;
    toggleSidebar: () => void;
}

export function MainHeader({ sidebarOpened, toggleSidebar }: MainHeaderProps) {
    return (
        <Group h="100%" px="md" justify="flex-end">
            <Burger opened={sidebarOpened} onClick={toggleSidebar} hiddenFrom="sm" size="sm" mr="auto" />
            <Group gap="sm">
                <Stack gap={0} align="flex-end">
                    <Text size="sm" fw={600}>
                        Username
                    </Text>
                    <Text size="xs" c="neutral.4">
                        Role
                    </Text>
                </Stack>
                <Avatar color="primary" radius="xl" size="md">
                    U
                </Avatar>
            </Group>
        </Group>
    );
}
