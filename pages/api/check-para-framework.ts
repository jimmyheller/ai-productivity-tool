// pages/api/check-para-framework.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import type { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

type DatabaseIds = {
  projects: string;
  areas: string;
  resources: string;
  archive: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { notionToken, userId } = body;
    
    if (!notionToken) {
      return res.status(400).json({ error: 'Missing Notion token' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing user ID' });
    }

    // Initialize Notion client with the provided token
    const notion = new Client({ auth: notionToken });

    console.log(`[Checking for existing PARA Framework for ${userId}]`);

    // Check if a PARA framework already exists
    const existingFramework = await checkExistingParaFramework(notion, userId);

    if (existingFramework.exists) {
      return res.status(200).json({
        exists: true,
        message: 'Existing PARA framework found',
        databaseIds: existingFramework.databaseIds,
      });
    } else {
      return res.status(200).json({
        exists: false,
        message: 'No existing PARA framework found',
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CHECK PARA FRAMEWORK ERROR]', error);
    return res.status(500).json({ error: 'Error checking for PARA framework', details: errorMessage });
  }
}

async function checkExistingParaFramework(notion: Client, userId: string): Promise<{ exists: boolean; databaseIds?: DatabaseIds }> {
  try {
    // Search for databases with the user ID in their properties
    // We'll look for the Projects database first, as it's the most distinctive
    const searchResponse = await notion.search({
      query: `PARA Framework`,
      filter: {
        property: 'object',
        value: 'database'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      page_size: 50 // Get enough results to find all PARA databases
    });
    
    // If no databases found, return false
    if (searchResponse.results.length === 0) {
      return { exists: false };
    }
    
    // Look for databases with names matching our PARA categories
    const projectsDb = searchResponse.results.find(db => {
      if ('title' in db) {
        const title = db.title.map(t => t.plain_text).join('');
        return title.toLowerCase() === 'projects';
      }
      return false;
    });
    
    const areasDb = searchResponse.results.find(db => {
      if ('title' in db) {
        const title = db.title.map(t => t.plain_text).join('');
        return title.toLowerCase() === 'areas';
      }
      return false;
    });
    
    const resourcesDb = searchResponse.results.find(db => {
      if ('title' in db) {
        const title = db.title.map(t => t.plain_text).join('');
        return title.toLowerCase() === 'resources';
      }
      return false;
    });
    
    const archiveDb = searchResponse.results.find(db => {
      if ('title' in db) {
        const title = db.title.map(t => t.plain_text).join('');
        return title.toLowerCase() === 'archive';
      }
      return false;
    });
    
    // If we found at least the Projects and Areas databases, consider it an existing PARA framework
    if (projectsDb && areasDb) {
      // Now verify these databases belong to this user by checking for the UserId property
      // Get the first page from the Projects database
      try {
        const projectsQuery = await notion.databases.query({
          database_id: projectsDb.id,
          page_size: 1,
        });
        
        // If there are pages, check if any have the user's ID
        if (projectsQuery.results.length > 0) {
          const page = projectsQuery.results[0];
          if ('properties' in page) {
            const properties = page.properties;
          
          // Look for a UserId property
          const userIdProperty = Object.values(properties).find(prop => {
            if (prop.type === 'rich_text') {
              const richTextArray = prop.rich_text;
              if (richTextArray.length > 0) {
                return richTextArray.some((rt: RichTextItemResponse) => rt.plain_text === userId);
              }
            }
            return false;
          });
          
          // If we found the user ID, this is definitely their PARA framework
          if (userIdProperty) {
            return {
              exists: true,
              databaseIds: {
                projects: projectsDb.id,
                areas: areasDb?.id || '',
                resources: resourcesDb?.id || '',
                archive: archiveDb?.id || ''
              }
            };
          }
          }
        }
      } catch (error) {
        console.error('Error querying projects database:', error);
        // If we can't query the database, it might be an access issue
        // We'll still return the databases we found
      }
      
      // If we couldn't verify by user ID but found matching databases,
      // assume they belong to the user since they have access
      return {
        exists: true,
        databaseIds: {
          projects: projectsDb.id,
          areas: areasDb?.id || '',
          resources: resourcesDb?.id || '',
          archive: archiveDb?.id || ''
        }
      };
    }
    
    // If we didn't find enough databases, return false
    return { exists: false };
  } catch (error) {
    console.error('Error checking for existing PARA framework:', error);
    return { exists: false };
  }
}

export default handler;
