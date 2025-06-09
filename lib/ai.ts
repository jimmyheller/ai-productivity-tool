import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to clean JSON responses from AI
function cleanJsonResponse(content: string): string {
  // Remove markdown code blocks and trim
  const cleaned = content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();
  
  // If the response doesn't start with {, it's likely natural language
  // Return appropriate empty structure based on context
  if (!cleaned.startsWith('{')) {
    // For PARA extraction
    if (content.toLowerCase().includes('para') || content.toLowerCase().includes('project')) {
      return '{"projects": [], "areas": [], "resources": [], "archives": []}';
    }
    // For task extraction
    return '{"tasks": []}';
  }
  
  return cleaned;
}

// Helper function to safely parse JSON with fallback
function safeJsonParse<T>(content: string, fallback: T): T {
  try {
    const cleaned = cleanJsonResponse(content);
    return JSON.parse(cleaned) as T;
  } catch {
    console.error('[JSON PARSE ERROR] Failed to parse:', content.substring(0, 100) + '...');
    return fallback;
  }
}

// Types

type ParaElement = {
  id: string;
  title: string;
  description?: string;
  type: 'project' | 'area' | 'resource' | 'archive';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  context?: string;
};

type ParaData = {
  projects: ParaElement[];
  areas: ParaElement[];
  resources: ParaElement[];
  archives: ParaElement[];
};

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};



// Extract PARA elements from chat messages in real-time
export async function extractParaFromChat(messages: Array<ChatMessage>): Promise<ParaData> {
  try {
    const systemPrompt = `You are an expert in the PARA Method productivity system. Analyze the conversation and classify content into:

**PROJECTS**: Specific outcomes with deadlines and multiple tasks (things you're working on)
**AREAS**: Ongoing responsibilities to maintain standards (things you want to maintain)  
**RESOURCES**: Topics of ongoing interest for future reference (things you want to reference)
**ARCHIVES**: Inactive items from the other categories (things you want to forget for now)

Guidelines:
- Projects have clear outcomes and deadlines
- Areas are ongoing without end dates
- Resources are for future reference or learning
- Archives are completed or no longer active
- Generate unique IDs for each element
- Include relevant context from the conversation
- If no PARA elements are found, return empty arrays for each category

CRITICAL: You MUST respond with ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or additional commentary. 

For any dueDate field, return a valid ISO 8601 format date (e.g. 2025-04-05).
Respond with ONLY this JSON structure: {
  "projects": [{
    "id": string,
    "title": string,
    "description": string (optional),
    "type": "project",
    "priority": string (low|medium|high) (optional),
    "dueDate": string (ISO 8601 or omit),
    "tags": [string] (optional),
    "context": string (optional)
  }],
  "areas": [{
    "id": string,
    "title": string,
    "description": string (optional),
    "type": "area",
    "priority": string (low|medium|high) (optional),
    "tags": [string] (optional),
    "context": string (optional)
  }],
  "resources": [{
    "id": string,
    "title": string,
    "description": string (optional),
    "type": "resource",
    "tags": [string] (optional),
    "context": string (optional)
  }],
  "archives": [{
    "id": string,
    "title": string,
    "description": string (optional),
    "type": "archive",
    "tags": [string] (optional),
    "context": string (optional)
  }]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini-2024-07-18',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content || '{}';
    return safeJsonParse(content, { projects: [], areas: [], resources: [], archives: [] });
  } catch (err) {
    console.error('[AI PARA EXTRACTION ERROR]', err);
    return { projects: [], areas: [], resources: [], archives: [] };
  }
}