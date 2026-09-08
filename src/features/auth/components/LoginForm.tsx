'use client';

import { Button, Card, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowRight, IconLock, IconUser } from '@tabler/icons-react';

export function LoginForm() {
    return (
        <Card w="100%" bg="white">
            <Stack gap="xl">
                <Stack gap={0} align="start">
                    <Title order={3} fw={800} c="neutral.6" mb={2}>
                        Selamat Datang
                    </Title>
                    <Text size="sm" c="neutral.4">
                        Masuk untuk mulai operasional toko
                    </Text>
                </Stack>

                <Stack gap="md">
                    <TextInput placeholder="Username" leftSection={<IconUser size={20} />} />
                    <PasswordInput placeholder="Kata Sandi" leftSection={<IconLock size={20} />} />
                </Stack>

                <Button color="primary" rightSection={<IconArrowRight size={14} />}>
                    Masuk
                </Button>
            </Stack>
        </Card>
    );
}
