import { Group, Stack, Text, Title } from '@mantine/core';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { RoleWrapper } from '@/features/auth/components/RoleWrapper';
import { parseSessionCookie } from '@/utils/session';

export const metadata: Metadata = {
    title: 'History',
};

export default async function HistoryPage() {
    const cookieStore = await cookies();
    const user = parseSessionCookie(cookieStore.get('stockpos_session')?.value);

    return (
        <RoleWrapper allowedRoles={['OWNER', 'INVENTORY']} user={user} type="page">
            <Stack gap="md" p="xl">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>History</Title>
                        <Text c="neutral.4" size="sm">
                            Lihat riwayat perubahan stok produk.
                        </Text>
                    </div>
                </Group>
            </Stack>
        </RoleWrapper>
    );
}
