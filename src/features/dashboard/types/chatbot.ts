export type ChatSender = 'ai' | 'user';

export interface ChatMessage {
    id: string;
    sender: ChatSender;
    text: string;
    time: string;
}
