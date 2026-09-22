'use client';

import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';

export function AccessDeniedView() {
    const router = useRouter();

    return (
        <Center mih="60vh">
            <Stack align="center" gap="xs">
                <Title order={3} c="neutral.7">
                    Akses Ditolak
                </Title>
                <Text c="neutral.4" size="sm" ta="center">
                    Role Anda tidak memiliki hak akses ke halaman ini.
                </Text>
                <Button onClick={() => router.push('/')} mt="md">
                    Kembali ke Dashboard
                </Button>
            </Stack>
        </Center>
    );
}
