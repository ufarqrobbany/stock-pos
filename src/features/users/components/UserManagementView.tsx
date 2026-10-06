'use client';

import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useUserContext } from '../hooks/useUserContext';
import { UserFilter } from './UserFilter';
import { UserFormModal } from './UserFormModal';
import { UserTable } from './UserTable';

export function UserManagementView() {
    const { openCreateModal } = useUserContext();

    return (
        <>
            <Stack gap="lg" p="xl">
                <Group justify="space-between" align="center">
                    <Stack gap={2}>
                        <Title order={2}>Manajemen Pengguna</Title>
                        <Text c="neutral.4" size="sm">
                            Kelola akun pengguna, peran akses, dan status pengguna sistem
                        </Text>
                    </Stack>
                    <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                        Tambah Pengguna
                    </Button>
                </Group>
                <UserFilter />
                <UserTable />
            </Stack>

            <UserFormModal />
        </>
    );
}
