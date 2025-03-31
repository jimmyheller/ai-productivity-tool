// pages/api/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeText } from '@/lib/ai';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let input: string;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    input = body.input;
  } catch (e) {
    console.error('[Parse Error]', e);
    return res.status(400).json({ error: 'Invalid request body format' });
  }

  if (!input || typeof input !== 'string' || input.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid input text' });
  }

  console.log('[Input Text]', input);

  try {
    const structured = await analyzeText(input);

    console.log('[Structured Output]', structured);

    return res.status(200).json({
      message: 'Structured data returned',
      structured,
    });
  } catch (err: any) {
    console.error('[AI ERROR]', err);
    return res.status(500).json({ error: 'Error processing input', details: err.message });
  }
}
