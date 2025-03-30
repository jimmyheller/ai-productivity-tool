import {OpenAI} from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function analyzeText(input: string): Promise<any> {
    try {
        const systemPrompt = `You are an intelligent assistant that helps organize thoughts. 
Classify the following input into tasks, notes, and ideas. 
For any dueDate field, return a valid ISO 8601 format date (e.g. 2025-04-05).
Respond with a JSON object with the structure: {
  "tasks": [{
    "title": string,
    "priority": string (low|medium|high),
    "dueDate": string (ISO 8601 or omit),
    "category": string (optional)
  }],
  "notes": [string],
  "ideas": [string]
}`;


        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini-2024-07-18', //cheapest model so far
            messages: [
                {role: 'system', content: systemPrompt},
                {role: 'user', content: input},
            ],
            temperature: 0.7,
        });

        const content = response.choices[0].message.content || '{}';
        return JSON.parse(content);
    } catch (err) {
        console.error('[AI ERROR]', err);
        return null;
    }
}
