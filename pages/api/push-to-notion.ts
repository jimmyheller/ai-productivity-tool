// pages/api/push-to-notion.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tasks } = req.body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid tasks array' });
  }

  try {
    for (const task of tasks) {
      if (!task?.title) continue;

      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [{ text: { content: task.title } }],
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
  } catch (err: any) {
    console.error('[Notion Push Error]', err);
    return res.status(500).json({ error: 'Failed to push tasks to Notion' });
  }
}
