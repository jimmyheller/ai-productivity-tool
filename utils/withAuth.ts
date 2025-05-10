//utils/withAuth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

export type NextApiHandlerWithAuth = (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => unknown | Promise<unknown>;

export default function withAuth(handler: NextApiHandlerWithAuth) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Pass the request directly to getAuth
      const auth = getAuth(req);
      const userId = auth?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return handler(req, res, userId);
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
}