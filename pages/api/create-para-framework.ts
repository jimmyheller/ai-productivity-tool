// pages/api/create-para-framework.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';
import { getPersonaData } from './save-persona';

type PersonaData = {
  name?: string;
  age?: string;
  occupation?: string;
  interests?: string[];
  currentProjects?: string[];
  workStyle?: string;
  preferences?: Record<string, string>;
  additionalInfo?: string;
};

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
  personaData: PersonaData | null,
  userId: string
): Promise<DatabaseIds> {
  try {
    // Check if we have access to pages in the user's workspace
    const searchResponse = await notion.search({
      query: '', // Empty query to get all accessible content
      filter: {
        property: 'object',
        value: 'page'
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
      page_size: 25 // Get enough pages to find root-level ones
    });
    
    if (searchResponse.results.length === 0) {
      throw new Error('No pages found. Please make sure the integration has access to at least one page in your Notion workspace.');
    }
    
    // Check if we have access to root-level pages
    // Note: Notion API doesn't allow creating pages directly in the workspace root,
    // but we can check if we have access to root-level pages as an indicator
    const rootLevelPages = [];
    const nestedPages = [];
    
    for (const result of searchResponse.results) {
      // Check if it's a page with parent property
      if ('parent' in result) {
        if (result.parent.type === 'workspace') {
          rootLevelPages.push(result);
        } else {
          nestedPages.push(result);
        }
      }
    }
    
    // Create a new page in the user's workspace that will contain all PARA databases
    const userName = personaData?.name || 'User';
    let rootPageReference;
    
    // If we have access to root-level pages, use one as a reference
    if (rootLevelPages.length > 0) {
      // We can't create directly in workspace, but we'll use a root-level page
      // This is the best we can do with the API limitations
      rootPageReference = rootLevelPages[0].id;
      console.log('Creating PARA framework at root level using reference page');
    } else {
      // We don't have access to root-level pages, inform the user
      throw new Error('Insufficient permissions to access root-level pages. Please update the Notion integration permissions to allow access to pages in your workspace root. This will ensure your PARA framework is easily accessible and not buried within other pages.');
    }
    
    // Create a dedicated page for the PARA framework with a comprehensive structure
    const paraPage = await notion.pages.create({
      parent: {
        type: 'page_id',
        page_id: rootPageReference
      },
      properties: {
        title: [
          {
            type: 'text',
            text: {
              content: `${userName}'s PARA Framework`
            }
          }
        ]
      },
      children: [
        {
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'PARA Productivity System'
                },
                annotations: {
                  bold: true,
                  color: 'blue'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Welcome to your personalized PARA framework! PARA stands for Projects, Areas, Resources, and Archive - a simple but powerful system for organizing your digital life.'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'What is PARA?'
                },
                annotations: {
                  bold: true
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'The PARA method organizes your digital information across four categories:'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Projects: '
                },
                annotations: {
                  bold: true,
                  color: 'green'
                }
              },
              {
                type: 'text',
                text: {
                  content: 'Short-term efforts with specific deadlines'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Areas: '
                },
                annotations: {
                  bold: true,
                  color: 'orange'
                }
              },
              {
                type: 'text',
                text: {
                  content: 'Ongoing responsibilities with no end date'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Resources: '
                },
                annotations: {
                  bold: true,
                  color: 'purple'
                }
              },
              {
                type: 'text',
                text: {
                  content: 'Topics or themes of ongoing interest'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Archive: '
                },
                annotations: {
                  bold: true,
                  color: 'gray'
                }
              },
              {
                type: 'text',
                text: {
                  content: 'Inactive items from the other categories'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Below you will find four databases to help you organize your tasks, responsibilities, and information. These have been personalized based on the information you provided during onboarding.'
                }
              }
            ]
          }
        }
      ]
    });
    
    // Use the newly created page as parent for all databases
    const parentPageId = paraPage.id;
    console.log(`Created PARA page with ID: ${parentPageId}`);
    
    // Common database schema for all PARA databases
    const commonProperties: Record<string, unknown> = {
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

    // First, add section headers to the page for each PARA component
    await notion.blocks.children.append({
      block_id: parentPageId,
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Projects'
                },
                annotations: {
                  bold: true,
                  color: 'green'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Short-term efforts with specific outcomes and deadlines.'
                }
              }
            ]
          }
        }
      ]
    });
    
    // Create Projects database
    const projectsDb = await notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: parentPageId
      },
      title: [
        {
          type: 'text',
          text: { content: 'Projects' }
        }
      ],
      properties: {
        ...commonProperties,
        'End Date': {
          date: {}
        },
        'Project Owner': {
          rich_text: {}
        },
        'Goal': {
          rich_text: {}
        }
      },
      icon: {
        type: 'emoji',
        emoji: '📋'
      }
    });

    // Add Areas section header
    await notion.blocks.children.append({
      block_id: parentPageId,
      children: [
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Areas'
                },
                annotations: {
                  bold: true,
                  color: 'orange'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Ongoing responsibilities with no end date that require maintenance over time.'
                }
              }
            ]
          }
        }
      ]
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
          text: { content: 'Areas' }
        }
      ],
      properties: {
        ...commonProperties,
        'Responsibility': {
          rich_text: {}
        },
        'Key Metrics': {
          rich_text: {}
        }
      },
      icon: {
        type: 'emoji',
        emoji: '🔄'
      }
    });

    // Add Resources section header
    await notion.blocks.children.append({
      block_id: parentPageId,
      children: [
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Resources'
                },
                annotations: {
                  bold: true,
                  color: 'purple'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Topics or themes of ongoing interest that you want to reference in the future.'
                }
              }
            ]
          }
        }
      ]
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
          text: { content: 'Resources' }
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
        },
        'Topics': {
          multi_select: {
            options: personaData?.interests?.map((interest: string) => ({
              name: interest,
              color: (['blue', 'green', 'orange', 'red', 'purple'] as const)[Math.floor(Math.random() * 5)]
            })) || []
          }
        }
      },
      icon: {
        type: 'emoji',
        emoji: '📖'
      }
    });

    // Add Archive section header
    await notion.blocks.children.append({
      block_id: parentPageId,
      children: [
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Archive'
                },
                annotations: {
                  bold: true,
                  color: 'gray'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Inactive items from the other categories that you might want to reference in the future.'
                }
              }
            ]
          }
        }
      ]
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
          text: { content: 'Archive' }
        }
      ],
      properties: {
        ...commonProperties,
        'Original Category': {
          select: {
            options: [
              { name: 'Project', color: 'green' },
              { name: 'Area', color: 'orange' },
              { name: 'Resource', color: 'purple' }
            ]
          }
        },
        'Archived Date': {
          date: {}
        },
        'Reason for Archiving': {
          rich_text: {}
        }
      },
      icon: {
        type: 'emoji',
        emoji: '🗃️'
      }
    });
    
    // Add a final note with tips for using the PARA system
    await notion.blocks.children.append({
      block_id: parentPageId,
      children: [
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Tips for Using Your PARA Framework'
                },
                annotations: {
                  bold: true
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Review your Projects weekly to track progress and update statuses'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Move completed projects to Archive when they\'re done'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Use Resources to collect information related to your interests'
                }
              }
            ]
          }
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Archive isn\'t for deletion - it\'s for items you might reference later'
                }
              }
            ]
          }
        }
      ]
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
  personaData: PersonaData,
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
