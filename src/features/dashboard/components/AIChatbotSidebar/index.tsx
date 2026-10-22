'use client';

import { ActionIcon, Box, Divider, Group, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { IconSend, IconSparkles, IconX } from '@tabler/icons-react';
import { useAIChatbot } from '../../hooks/useAIChatbot';
import { AIChatBubble } from './AIChatBubble';
import classes from './index.module.css';

export interface AIChatbotSidebarProps {
    opened: boolean;
    onClose?: () => void;
}

export function AIChatbotSidebar({ opened, onClose }: AIChatbotSidebarProps) {
    const { messages, inputValue, setInputValue, isLoading, showLoadingBubble, messagesEndRef, handleSend } =
        useAIChatbot({ opened });

    return (
        <Box className={classes.aside} p="sm" data-open={opened}>
            <Group justify="space-between" align="center" mb={8}>
                <Group gap={8} align="center">
                    <IconSparkles size={20} color="var(--mantine-color-primary-6)" />
                    <Text fw={600} size="md">
                        Asisten AI
                    </Text>
                </Group>

                {onClose && (
                    <ActionIcon variant="subtle" color="gray" onClick={onClose}>
                        <IconX size={18} />
                    </ActionIcon>
                )}
            </Group>

            <Divider my={4} />

            <ScrollArea flex={1} mih={0} scrollbarSize={6}>
                <Stack gap="md" py="xs" pr={4}>
                    {messages.map((msg) => (
                        <AIChatBubble key={msg.id} message={msg} />
                    ))}

                    {showLoadingBubble && <AIChatBubble isLoading />}

                    <div ref={messagesEndRef} />
                </Stack>
            </ScrollArea>

            <Divider my={6} />

            <Group gap="sm" py="sm" align="center">
                <TextInput
                    placeholder="Tanya seputar data toko..."
                    flex={1}
                    size="sm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    disabled={isLoading}
                />
                <ActionIcon size="lg" onClick={() => handleSend()} disabled={!inputValue.trim() || isLoading}>
                    <IconSend size={14} />
                </ActionIcon>
            </Group>
        </Box>
    );
}
