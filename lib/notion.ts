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



/**
 * Creates PARA framework elements in Notion with provided configuration
 * 
 * Note: Your Notion database should have these properties for best results:
 * - Name (Title) - Required
 * - Type (Text) - For PARA category (PROJECT, AREA, RESOURCE, ARCHIVE)
 * - Description (Text) - For element description
 * - Priority (Text) - For priority level
 * - Due Date (Text) - For deadlines
 * - Tags (Text) - For comma-separated tags
 * - Context (Text) - For conversation context
 */
export async function createNotionParaElementsWithConfig(
  paraElements: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'project' | 'area' | 'resource' | 'archive';
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    tags?: string[];
    context?: string;
  }>,
  notionConfig: {
    notionToken: string;
    notionDatabaseId: string;
  }
) {
  const client = new Client({ auth: notionConfig.notionToken });
  const databaseId = notionConfig.notionDatabaseId;
  
  const results = [];
  
  for (const element of paraElements) {
    if (!element?.title) continue;

    // First, try to get database properties to understand the schema
    let databaseProperties: Record<string, { type: string; [key: string]: unknown }> = {};
    try {
      const database = await client.databases.retrieve({ database_id: databaseId });
      databaseProperties = database.properties || {};
    } catch {
      console.warn('[Notion] Could not retrieve database schema, using fallback approach');
    }

    // Build properties object based on what exists in the database
    const properties: Record<string, unknown> = {
      // Name/Title is required and should always exist
      Name: {
        title: [{ text: { content: element.title } }],
      },
    };

    // Add optional properties only if they exist in the database
    if (element.type && databaseProperties.Type) {
      if (databaseProperties.Type.type === 'select') {
        properties.Type = { select: { name: element.type.toUpperCase() } };
      } else {
        properties.Type = { rich_text: [{ text: { content: element.type.toUpperCase() } }] };
      }
    }

    if (element.description && databaseProperties.Description) {
      properties.Description = { rich_text: [{ text: { content: element.description } }] };
    }

    if (element.dueDate && databaseProperties['Due Date']) {
      if (databaseProperties['Due Date'].type === 'date') {
        properties['Due Date'] = { date: { start: element.dueDate } };
      } else {
        properties['Due Date'] = { rich_text: [{ text: { content: element.dueDate } }] };
      }
    }

    if (element.priority && databaseProperties.Priority) {
      if (databaseProperties.Priority.type === 'select') {
        properties.Priority = { select: { name: element.priority } };
      } else {
        properties.Priority = { rich_text: [{ text: { content: element.priority } }] };
      }
    }

    if (element.tags && element.tags.length > 0 && databaseProperties.Tags) {
      if (databaseProperties.Tags.type === 'multi_select') {
        properties.Tags = { multi_select: element.tags.map(tag => ({ name: tag })) };
      } else {
        properties.Tags = { rich_text: [{ text: { content: element.tags.join(', ') } }] };
      }
    }

    if (element.context && databaseProperties.Context) {
      properties.Context = { rich_text: [{ text: { content: element.context } }] };
    }

    // Add a fallback description in the Name if no Description property exists
    if (element.description && !databaseProperties.Description) {
      properties.Name = {
        title: [{ text: { content: `${element.title} - ${element.description}` } }],
      };
    }

    try {
      const result = await client.pages.create({
        parent: { database_id: databaseId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        properties: properties as Record<string, any>,
      });
      
      results.push(result);
    } catch (error) {
      console.error(`[Notion] Failed to create page for element "${element.title}":`, error);
      // Continue with other elements even if one fails
      throw new Error(`Failed to create Notion page for "${element.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
}