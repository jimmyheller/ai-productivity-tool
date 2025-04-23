import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { extractTasksFromChat } from '@/lib/ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { messages, extractTasks = false } = await req.json();

  // If extractTasks is true, we need to extract tasks from the messages
  if (extractTasks) {
    try {
      const taskData = await extractTasksFromChat(messages);
      return new Response(JSON.stringify({ tasks: taskData.tasks }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[CHAT TASK EXTRACTION ERROR]', error);
      return new Response(JSON.stringify({ error: 'Failed to extract tasks' }), {
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