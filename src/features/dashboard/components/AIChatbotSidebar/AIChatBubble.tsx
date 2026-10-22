'use client';

import { Box, Loader, Text } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../../types/chatbot';
import classes from './index.module.css';

export interface AIChatBubbleProps {
    message?: ChatMessage;
    isLoading?: boolean;
}

export function AIChatBubble({ message, isLoading }: AIChatBubbleProps) {
    if (!message && !isLoading) return null;

    const isUser = message?.sender === 'user';

    return (
        <Box className={classes.messageWrapper} data-sender={isUser ? 'user' : 'ai'}>
            <Box className={classes.bubble}>
                {!isUser && (
                    <Text size="xs" fw={600} c="primary.6" mb={2}>
                        Asisten AI
                    </Text>
                )}

                {isLoading ? (
                    <Loader size="xs" type="dots" color="primary.6" />
                ) : isUser ? (
                    <Text size="xs" className={classes.userText}>
                        {message?.text}
                    </Text>
                ) : (
                    <Box className={classes.markdownContent}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message?.text || ''}</ReactMarkdown>
                    </Box>
                )}
            </Box>

            {message?.time && (
                <Text size="10px" c="dimmed" mt={2} ta={isUser ? 'right' : 'left'} suppressHydrationWarning>
                    {message.time}
                </Text>
            )}
        </Box>
    );
}
