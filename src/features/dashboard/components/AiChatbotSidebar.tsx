'use client';

import { ActionIcon, Card, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconSend, IconSparkles } from '@tabler/icons-react';

export function AiChatbotSidebar() {
    return (
        <Card withBorder p="md" radius="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            <Group justify="space-between" mb="md">
                <Group gap="xs">
                    <IconSparkles size={18} color="var(--mantine-color-blue-6)" />
                    <Title order={5}>Chat with Metabot</Title>
                </Group>
            </Group>

            <Stack gap="sm" style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
                <div
                    style={{
                        backgroundColor: 'var(--mantine-color-default-hover)',
                        padding: '10px 12px',
                        borderRadius: '8px',
                    }}
                >
                    <Text size="xs" c="dimmed" mb={4}>
                        Metabot AI
                    </Text>
                    <Text size="xs">
                        Halo! Ada yang bisa saya bantu analisa terkait data penjualan atau stok toko hari ini?
                    </Text>
                </div>
            </Stack>

            <Group mt="md" gap={6}>
                <TextInput placeholder="Tanya seputar data toko..." style={{ flex: 1 }} size="xs" />
                <ActionIcon variant="filled" color="orange" size="md">
                    <IconSend size={14} />
                </ActionIcon>
            </Group>
        </Card>
    );
}
