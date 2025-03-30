// pages/api/submit.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { text } = req.body;
        console.log('Received input:', text);
        res.status(200).json({ message: 'Input received successfully' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
