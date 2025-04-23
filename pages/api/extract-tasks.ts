// pages/api/extract-tasks.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { extractTasksFromChat } from '@/lib/ai';
import withAuth from '@/utils/withAuth';

async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let messages;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    messages = body.messages;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid messages array' });
    }
  } catch (error) {
    console.error('[Parse Error]', error);
    return res.status(400).json({ error: 'Invalid request body format' });
  }

  console.log(`[Task Extraction Request from ${userId}]`);

  try {
    const data = await extractTasksFromChat(messages);

    console.log('[Extracted Tasks]', data.tasks);

    return res.status(200).json({
      message: 'Tasks extracted successfully',
      tasks: data.tasks || [],
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI TASK EXTRACTION ERROR]', error);
    return res.status(500).json({ error: 'Error extracting tasks', details: errorMessage });
  }
}

export default withAuth(handler);