import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { extractParaFromChat } from '@/lib/ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { messages, extractPara = false } = await req.json();

  // If extractPara is true, extract PARA elements from the messages
  if (extractPara) {
    try {
      const paraData = await extractParaFromChat(messages);
      return new Response(JSON.stringify({ para: paraData }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[CHAT PARA EXTRACTION ERROR]', error);
      return new Response(JSON.stringify({ error: 'Failed to extract PARA elements' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Otherwise, just stream the chat response
  const result = streamText({
    model: openai('gpt-4o-mini-2024-07-18'),
    messages,
  });
  
  return result.toDataStreamResponse();
}