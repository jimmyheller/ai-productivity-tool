// pages/api/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import { analyzeText } from '@/lib/ai';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let text: string;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    text = body.input;
  } catch (e) {
    console.error('[Parse Error]', e);
    return res.status(400).json({ error: 'Invalid request body format' });
  }
  console.log('[Input Text]', text);

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid input text' });
  }

  try {
    const structured = await analyzeText(text);
    console.log('[Structured Output]', JSON.stringify(structured, null, 2));

    if (!structured || !structured.tasks?.length) {
      return res.status(400).json({ message: 'Could not extract structured tasks from input.' });
    }

    // Push first task to Notion for now (MVP)
    const task = structured.tasks[0];

    console.log('[Sending to Notion]', JSON.stringify(task, null, 2));
    await notion.pages.create({
  parent: { database_id: databaseId },
  properties: {
    Name: {
      title: [{ text: { content: task.title } }],
    },
    ...(task.priority && {
      Priority: {
        rich_text: [{ text: { content: task.priority } }],
      },
    }),
    ...(task.dueDate && {
      "Due Date": {
        rich_text: [{ text: { content: task.dueDate } }],
      },
    }),
    ...(task.category && {
      Category: {
        rich_text: [{ text: { content: task.category } }],
      },
    }),
  },
});


    res.status(200).json({
      message: 'Submitted successfully',
      structured, // ← include the AI output
    });

  } catch (error) {
    console.error('Error submitting to Notion:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
