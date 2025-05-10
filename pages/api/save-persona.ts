// pages/api/save-persona.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

type PersonaData = {
  name: string;
  age: string;
  occupation: string;
  interests: string[];
  currentProjects: string[];
  workStyle: string;
  preferences: Record<string, string>;
};

// In a real application, you would store this in a database
// For now, we'll use a simple in-memory store
const userPersonaStore: Record<string, PersonaData> = {};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { userId, personaData } = body;
    
    if (!personaData) {
      return res.status(400).json({ error: 'Missing persona data' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Store the persona data with the user's ID
    userPersonaStore[userId] = personaData;
    
    console.log(`[Persona Data Saved for ${userId}]`, personaData);

    // In a real application, you would save this to a database
    // For example: await db.collection('users').updateOne({ userId }, { $set: { personaData } });

    return res.status(200).json({
      message: 'Persona data saved successfully',
      userId,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SAVE PERSONA ERROR]', error);
    return res.status(500).json({ error: 'Error saving persona data', details: errorMessage });
  }
}

// Function to get persona data by user ID (for use in other API routes)
export function getPersonaData(userId: string): PersonaData | null {
  return userPersonaStore[userId] || null;
}

export default handler;
