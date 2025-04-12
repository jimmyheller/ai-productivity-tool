// pages/api/push-to-notion.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import withAuth from '@/utils/withAuth';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

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
    
    for (const task of tasks) {
      if (!task?.title) continue;

      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [{ text: { content: task.title } }],
          },
          // Store the user ID with the task
          UserId: {
            rich_text: [{ text: { content: userId } }],
          },
          ...(task.dueDate && {
            'Due Date': {
              rich_text: [{ text: { content: task.dueDate } }],
            },
          }),
          ...(task.priority && {
            Priority: {
              rich_text: [{ text: { content: task.priority } }],
            },
          }),
          ...(task.category && {
            Category: {
              rich_text: [{ text: { content: task.category } }],
            },
          }),
        },
      });
    }

    return res.status(200).json({ message: 'Tasks pushed to Notion' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notion Push Error]', error);
    return res.status(500).json({ error: 'Failed to push tasks to Notion', details: errorMessage });
  }
}

export default withAuth(handler);