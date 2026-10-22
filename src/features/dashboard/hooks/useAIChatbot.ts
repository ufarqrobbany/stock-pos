'use client';

import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { dexieChatbotTools } from '../services/dexieChatbotTools';
import type { ChatMessage } from '../types/chatbot';

const INITIAL_MSG: ChatMessage = {
    id: '1',
    sender: 'ai',
    text: 'Halo! Saya Asisten AI StockPOS. Ada yang bisa saya bantu analisa terkait data penjualan, transaksi, atau stok toko hari ini?',
    time: new Date().toTimeString().slice(0, 5),
};

export interface UseAIChatbotOptions {
    opened?: boolean;
}

export function useAIChatbot({ opened = false }: UseAIChatbotOptions = {}) {
    const [inputValue, setInputValue] = useState('');
    const [fallbackError, setFallbackError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const {
        messages: aiMessages,
        sendMessage,
        status,
        stop,
        addToolOutput,
    } = useChat({
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        onError: () => {
            setFallbackError(
                'Maaf, terjadi kendala saat memproses jawaban atau server sedang sibuk. Silakan coba ajukan pertanyaan kembali.'
            );
        },
        onToolCall: async ({ toolCall }) => {
            const toolName = toolCall.toolName as keyof typeof dexieChatbotTools;
            const handler = dexieChatbotTools[toolName] as
                | ((input: Record<string, unknown>) => Promise<unknown>)
                | undefined;
            const toolInput = (toolCall.input ?? {}) as Record<string, unknown>;
            type ToolOutputParam = Parameters<typeof addToolOutput>[0];

            try {
                const result = handler
                    ? await handler(toolInput)
                    : { error: `Tool ${toolCall.toolName} tidak tersedia` };

                setTimeout(() => {
                    addToolOutput({
                        tool: toolCall.toolName as ToolOutputParam['tool'],
                        toolCallId: toolCall.toolCallId,
                        output: result,
                    });
                }, 0);
            } catch (err: unknown) {
                const errorMsg = err instanceof Error ? err.message : 'Gagal mengakses database Dexie';
                setTimeout(() => {
                    addToolOutput({
                        tool: toolCall.toolName as ToolOutputParam['tool'],
                        toolCallId: toolCall.toolCallId,
                        output: { error: errorMsg },
                    });
                }, 0);
            }
        },
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    useEffect(() => {
        if (!isLoading) return;
        const timer = setTimeout(() => {
            stop();
            setFallbackError('Waktu tunggu respons habis (timeout). Silakan ulangi pertanyaan Anda.');
        }, 60000);
        return () => clearTimeout(timer);
    }, [isLoading, stop]);

    const messages: ChatMessage[] = useMemo(() => {
        const parsed: ChatMessage[] = [
            INITIAL_MSG,
            ...aiMessages
                .filter((m) => {
                    if (m.role === 'user') return true;
                    const text = m.parts
                        ?.filter((p) => p.type === 'text')
                        .map((p) => (p as { text: string }).text)
                        .join('');
                    return Boolean(text && text.trim().length > 0);
                })
                .map((m) => ({
                    id: m.id,
                    sender: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
                    text: m.parts
                        ? m.parts
                              .filter((p) => p.type === 'text')
                              .map((p) => (p as { text: string }).text)
                              .join('')
                        : '',
                    time: new Date().toTimeString().slice(0, 5),
                })),
        ];

        if (!isLoading && parsed.length > 1 && parsed[parsed.length - 1]?.sender === 'user') {
            parsed.push({
                id: 'fallback-error',
                sender: 'ai',
                text:
                    fallbackError ||
                    'Maaf, saya tidak dapat memproses jawaban saat ini. Silakan coba ajukan pertanyaan kembali.',
                time: new Date().toTimeString().slice(0, 5),
            });
        }

        return parsed;
    }, [aiMessages, isLoading, fallbackError]);

    useEffect(() => {
        if (opened && (messages.length > 0 || isLoading)) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, opened]);

    const handleSend = async () => {
        const query = inputValue.trim();
        if (!query || isLoading) return;

        setFallbackError(null);
        setInputValue('');
        await sendMessage({ text: query });
    };

    const showLoadingBubble = isLoading && (messages.length === 0 || messages[messages.length - 1]?.sender === 'user');

    return {
        messages,
        inputValue,
        setInputValue,
        isLoading,
        showLoadingBubble,
        messagesEndRef,
        handleSend,
        stop,
    };
}
