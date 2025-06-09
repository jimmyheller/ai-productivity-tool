// pages/api/push-para-to-notion.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import withAuth from '@/utils/withAuth';
import { createNotionParaElementsWithConfig } from '@/lib/notion';

async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paraElements, notionConfig } = req.body;

  if (!Array.isArray(paraElements) || paraElements.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid paraElements array' });
  }

  if (!notionConfig || !notionConfig.notionToken || !notionConfig.notionDatabaseId) {
    return res.status(400).json({ error: 'Missing Notion configuration' });
  }

  try {
    console.log(`[Notion PARA from ${userId}]`, paraElements);
    
    // Use our new function to create PARA elements with provided credentials
    const results = await createNotionParaElementsWithConfig(paraElements, notionConfig);

    return res.status(200).json({ 
      message: 'PARA elements pushed to Notion',
      count: results.length
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notion PARA Push Error]', error);
    return res.status(500).json({ 
      error: 'Failed to push PARA elements to Notion', 
      details: errorMessage 
    });
  }
}

export default withAuth(handler);