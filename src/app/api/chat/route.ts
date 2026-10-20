import { groq } from '@ai-sdk/groq';
import { convertToModelMessages, streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'GROQ_API_KEY belum dikonfigurasi' }, { status: 500 });
    }

    const { messages } = await req.json().catch(() => ({}));
    if (!Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: 'Daftar pesan tidak valid' }, { status: 400 });
    }

    try {
        const modelMessages = await convertToModelMessages(messages);

        const result = streamText({
            model: groq(process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'),
            messages: modelMessages,
        });

        return result.toUIMessageStreamResponse();
    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Gagal memproses permintaan AI';
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
