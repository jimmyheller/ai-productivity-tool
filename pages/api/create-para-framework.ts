// pages/api/create-para-framework.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import { getPersonaData } from './save-persona';

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

    // Get the user's persona data to personalize the PARA framework
    const personaData = getPersonaData(userId);

    console.log(`[Creating PARA Framework for ${userId}]`);

    // Create the PARA framework databases
    const databaseIds = await createParaFramework(notion, personaData, userId);

    return res.status(200).json({
      message: 'PARA framework created successfully',
      databaseIds,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CREATE PARA FRAMEWORK ERROR]', error);
    return res.status(500).json({ error: 'Error creating PARA framework', details: errorMessage });
  }
}

async function createParaFramework(
  notion: Client,
  personaData: any,
  userId: string
): Promise<DatabaseIds> {
  try {
    // First, get a valid page ID where we can create databases
    // We'll search for pages the integration has access to
    const searchResponse = await notion.search({
      filter: {
        property: 'object',
        value: 'page'
      }
    });
    
    if (searchResponse.results.length === 0) {
      throw new Error('No pages found. Please make sure the integration has access to at least one page in your Notion workspace.');
    }
    
    // Use the first page found as parent
    const parentPageId = searchResponse.results[0].id;
    console.log(`Using parent page ID: ${parentPageId}`);
    
    // Common database schema for all PARA databases
    const commonProperties: any = {
      Name: {
        title: {}
      },
      Status: {
        select: {
          options: [
            { name: 'Not Started', color: 'gray' },
            { name: 'In Progress', color: 'blue' },
            { name: 'Completed', color: 'green' },
            { name: 'On Hold', color: 'orange' }
          ]
        }
      },
      Priority: {
        select: {
          options: [
            { name: 'Low', color: 'gray' },
            { name: 'Medium', color: 'yellow' },
            { name: 'High', color: 'red' }
          ]
        }
      },
      'Due Date': {
        date: {}
      },
      Notes: {
        rich_text: {}
      },
      UserId: {
        rich_text: {}
      }
    };

    // Create Projects database
    const projectsDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: { content: 'PARA - Projects' }
        }
      ],
      properties: {
        ...commonProperties,
        'End Date': {
          date: {}
        },
        'Project Owner': {
          rich_text: {}
        }
      }
    });

    // Create Areas database
    const areasDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: { content: 'PARA - Areas' }
        }
      ],
      properties: {
        ...commonProperties,
        'Responsibility': {
          rich_text: {}
        }
      }
    });

    // Create Resources database
    const resourcesDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: { content: 'PARA - Resources' }
        }
      ],
      properties: {
        ...commonProperties,
        'Category': {
          select: {
            options: [
              { name: 'Article', color: 'blue' },
              { name: 'Book', color: 'green' },
              { name: 'Course', color: 'orange' },
              { name: 'Video', color: 'red' },
              { name: 'Podcast', color: 'purple' },
              { name: 'Other', color: 'gray' }
            ]
          }
        },
        'URL': {
          url: {}
        }
      }
    });

    // Create Archive database
    const archiveDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: { content: 'PARA - Archive' }
        }
      ],
      properties: {
        ...commonProperties,
        'Original Category': {
          select: {
            options: [
              { name: 'Project', color: 'blue' },
              { name: 'Area', color: 'green' },
              { name: 'Resource', color: 'orange' }
            ]
          }
        },
        'Archived Date': {
          date: {}
        }
      }
    });

    // Populate with initial data based on persona if available
    if (personaData) {
      await populateInitialData(notion, {
        projects: projectsDb.id,
        areas: areasDb.id,
        resources: resourcesDb.id,
        archive: archiveDb.id
      }, personaData, userId);
    }

    return {
      projects: projectsDb.id,
      areas: areasDb.id,
      resources: resourcesDb.id,
      archive: archiveDb.id
    };
  } catch (error) {
    console.error('Error creating PARA framework:', error);
    throw error;
  }
}

async function populateInitialData(
  notion: Client,
  databaseIds: DatabaseIds,
  personaData: any,
  userId: string
) {
  // Add current projects from persona data to Projects database
  if (personaData.currentProjects && Array.isArray(personaData.currentProjects)) {
    for (const project of personaData.currentProjects) {
      await notion.pages.create({
        parent: { database_id: databaseIds.projects },
        properties: {
          Name: {
            title: [{ text: { content: project } }]
          },
          Status: {
            select: { name: 'Not Started' }
          },
          Priority: {
            select: { name: 'Medium' }
          },
          UserId: {
            rich_text: [{ text: { content: userId } }]
          }
        }
      });
    }
  }

  // Add areas based on occupation and interests
  if (personaData.occupation) {
    await notion.pages.create({
      parent: { database_id: databaseIds.areas },
      properties: {
        Name: {
          title: [{ text: { content: 'Work' } }]
        },
        Responsibility: {
          rich_text: [{ text: { content: personaData.occupation } }]
        },
        UserId: {
          rich_text: [{ text: { content: userId } }]
        }
      }
    });
  }

  // Add standard life areas
  const standardAreas = ['Health', 'Finances', 'Relationships', 'Personal Development'];
  for (const area of standardAreas) {
    await notion.pages.create({
      parent: { database_id: databaseIds.areas },
      properties: {
        Name: {
          title: [{ text: { content: area } }]
        },
        UserId: {
          rich_text: [{ text: { content: userId } }]
        }
      }
    });
  }

  // Add resources based on interests
  if (personaData.interests && Array.isArray(personaData.interests)) {
    for (const interest of personaData.interests) {
      await notion.pages.create({
        parent: { database_id: databaseIds.resources },
        properties: {
          Name: {
            title: [{ text: { content: `Resources on ${interest}` } }]
          },
          Category: {
            select: { name: 'Other' }
          },
          UserId: {
            rich_text: [{ text: { content: userId } }]
          }
        }
      });
    }
  }
}

export default handler;
