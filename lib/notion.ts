import { Client } from '@notionhq/client';

interface UserNotionConfig {
  notionToken: string;
  notionDatabaseId: string;
}

export function getUserNotionConfig(userId: string): UserNotionConfig | null {
  // In a production app, you would fetch this from a database
  // For now, we're using localStorage which only works client-side
  if (typeof window !== 'undefined') {
    const savedSettings = localStorage.getItem(`user_settings_${userId}`);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.notionToken && settings.notionDatabaseId) {
          return {
            notionToken: settings.notionToken,
            notionDatabaseId: settings.notionDatabaseId,
          };
        }
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }

  return null;
}

export function getNotionClient(userId: string): Client | null {
  const config = getUserNotionConfig(userId);
  
  if (!config) {
    return null;
  }
  
  return new Client({ auth: config.notionToken });
}

export async function createNotionTasks(
  userId: string,
  tasks: Array<{
    title: string;
    priority?: string;
    dueDate?: string;
    category?: string;
  }>
) {
  const client = getNotionClient(userId);
  const config = getUserNotionConfig(userId);
  
  if (!client || !config) {
    throw new Error('Notion client not configured. Please update your Notion settings.');
  }

  const databaseId = config.notionDatabaseId;
  
  const results = [];
  
  for (const task of tasks) {
    if (!task?.title) continue;

    const result = await client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: task.title } }],
        },
        // Store the user ID with the task
        UserId: {
          rich_text: [{ text: { content: userId } }],
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
    
    results.push(result);
  }
  
  return results;
}