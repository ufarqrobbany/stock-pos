'use client';

import { Button, Card, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowRight, IconLock, IconUser } from '@tabler/icons-react';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm() {
    const { form, handleSubmit } = useLoginForm();

    return (
        <Card component="form" onSubmit={form.onSubmit(handleSubmit)} w="100%" bg="white">
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
                    <TextInput
                        placeholder="Username"
                        leftSection={<IconUser size={20} />}
                        {...form.getInputProps('username')}
                    />
                    <PasswordInput
                        placeholder="Kata Sandi"
                        leftSection={<IconLock size={20} />}
                        {...form.getInputProps('password')}
                    />
                </Stack>

                <Button type="submit" color="primary" rightSection={<IconArrowRight size={14} />}>
                    Masuk
                </Button>
            </Stack>
        </Card>
    );
}
