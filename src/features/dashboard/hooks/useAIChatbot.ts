'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage } from '../types/chatbot';

const INITIAL_MSG: ChatMessage = {
    id: '1',
    sender: 'ai',
    text: 'Halo! Saya Asisten AI StockPOS. Ada yang bisa saya bantu analisa terkait data penjualan atau stok toko hari ini?',
    time: new Date().toTimeString().slice(0, 5),
};

export interface UseAIChatbotOptions {
    opened?: boolean;
}

export function useAIChatbot({ opened = false }: UseAIChatbotOptions = {}) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages: aiMessages, sendMessage, status, stop } = useChat();

    const isLoading = status === 'submitted' || status === 'streaming';

    const messages: ChatMessage[] = useMemo(
        () => [
            INITIAL_MSG,
            ...aiMessages.map((m) => ({
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
        ],
        [aiMessages]
    );

    useEffect(() => {
        if (opened && (messages.length > 0 || isLoading)) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, opened]);

    const handleSend = async () => {
        const query = inputValue.trim();
        if (!query || isLoading) return;

        setInputValue('');
        await sendMessage({ text: query });
    };

    return {
        messages,
        inputValue,
        setInputValue,
        isLoading,
        messagesEndRef,
        handleSend,
        stop,
    };
}
