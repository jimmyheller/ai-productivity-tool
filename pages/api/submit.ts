// pages/api/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeText } from '@/lib/ai';
import withAuth from '@/utils/withAuth';

async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let input: string;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    input = body.input;
  } catch (error) {
    console.error('[Parse Error]', error);
    return res.status(400).json({ error: 'Invalid request body format' });
  }

  if (!input || typeof input !== 'string' || input.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid input text' });
  }

  console.log(`[Input Text from ${userId}]`, input);

  try {
    const structured = await analyzeText(input);

    console.log('[Structured Output]', structured);

    return res.status(200).json({
      message: 'Structured data returned',
      structured,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AI ERROR]', error);
    return res.status(500).json({ error: 'Error processing input', details: errorMessage });
  }
}

export default withAuth(handler);
