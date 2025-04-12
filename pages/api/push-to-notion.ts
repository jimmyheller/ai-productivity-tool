// pages/api/push-to-notion.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import withAuth from '@/utils/withAuth';
import { createNotionTasks } from '@/lib/notion';

async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tasks } = req.body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid tasks array' });
  }

  try {
    console.log(`[Notion Tasks from ${userId}]`, tasks);
    
    // Use our new function to create tasks with user-specific credentials
    const results = await createNotionTasks(userId, tasks);

    return res.status(200).json({ 
      message: 'Tasks pushed to Notion',
      count: results.length
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notion Push Error]', error);
    return res.status(500).json({ 
      error: 'Failed to push tasks to Notion', 
      details: errorMessage 
    });
  }
}

export default withAuth(handler);