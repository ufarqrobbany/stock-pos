'use client';

import { Center, Container, Stack, Text, Title } from '@mantine/core';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
    return (
        <Center mih="100vh" p="md">
            <Container size="xs" p={0} w="100%" maw={420}>
                <Stack gap="xl" align="center" w="100%">
                    <Stack gap={2} align="center">
                        <Title order={1} fw={800} fz={32} c="primary.6">
                            <Text span fw={800} fz={28} c="neutral.6">
                                Stock
                            </Text>
                            POS
                        </Title>
                        <Text fz="sm" c="neutral.4">
                            Inventory Management System & Point of Sale
                        </Text>
                    </Stack>
                    <LoginForm />
                </Stack>
            </Container>
        </Center>
    );
}
