import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { UserTable } from '@/features/users/components/UserTable';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'Manajemen Pengguna',
};

export default async function UsersPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER']} user={user} type="page">
            <Stack gap="md" p="xl">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>Manajemen Pengguna</Title>
                        <Text c="neutral.4" size="sm">
                            Kelola akun pengguna, peran akses, dan status pengguna sistem.
                        </Text>
                    </div>

                    <Button leftSection={<IconPlus size={16} />} color="primary">
                        Tambah Pengguna
                    </Button>
                </Group>
                <UserTable />
            </Stack>
        </RoleWrapper>
    );
}
