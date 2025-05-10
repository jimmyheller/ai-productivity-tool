module.exports = {

"[externals]/next/dist/compiled/next-server/pages-api.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@notionhq/client [external] (@notionhq/client, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@notionhq/client", () => require("@notionhq/client"));

module.exports = mod;
}}),
"[project]/pages/api/save-persona.ts [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// pages/api/save-persona.ts
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__),
    "getPersonaData": (()=>getPersonaData)
});
// In a real application, you would store this in a database
// For now, we'll use a simple in-memory store
const userPersonaStore = {};
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { userId, personaData } = body;
        if (!personaData) {
            return res.status(400).json({
                error: 'Missing persona data'
            });
        }
        if (!userId) {
            return res.status(400).json({
                error: 'Missing user ID'
            });
        }
        // Store the persona data with the user's ID
        userPersonaStore[userId] = personaData;
        console.log(`[Persona Data Saved for ${userId}]`, personaData);
        // In a real application, you would save this to a database
        // For example: await db.collection('users').updateOne({ userId }, { $set: { personaData } });
        return res.status(200).json({
            message: 'Persona data saved successfully',
            userId
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[SAVE PERSONA ERROR]', error);
        return res.status(500).json({
            error: 'Error saving persona data',
            details: errorMessage
        });
    }
}
function getPersonaData(userId) {
    return userPersonaStore[userId] || null;
}
const __TURBOPACK__default__export__ = handler;
}}),
"[project]/pages/api/create-para-framework.ts [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// pages/api/create-para-framework.ts
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f40$notionhq$2f$client__$5b$external$5d$__$2840$notionhq$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@notionhq/client [external] (@notionhq/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$save$2d$persona$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/pages/api/save-persona.ts [api] (ecmascript)");
;
;
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { notionToken, userId } = body;
        if (!notionToken) {
            return res.status(400).json({
                error: 'Missing Notion token'
            });
        }
        if (!userId) {
            return res.status(400).json({
                error: 'Missing user ID'
            });
        }
        // Initialize Notion client with the provided token
        const notion = new __TURBOPACK__imported__module__$5b$externals$5d2f40$notionhq$2f$client__$5b$external$5d$__$2840$notionhq$2f$client$2c$__cjs$29$__["Client"]({
            auth: notionToken
        });
        // Get the user's persona data to personalize the PARA framework
        const personaData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$save$2d$persona$2e$ts__$5b$api$5d$__$28$ecmascript$29$__["getPersonaData"])(userId);
        console.log(`[Creating PARA Framework for ${userId}]`);
        // Create the PARA framework databases
        const databaseIds = await createParaFramework(notion, personaData, userId);
        return res.status(200).json({
            message: 'PARA framework created successfully',
            databaseIds
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[CREATE PARA FRAMEWORK ERROR]', error);
        return res.status(500).json({
            error: 'Error creating PARA framework',
            details: errorMessage
        });
    }
}
async function createParaFramework(notion, personaData, userId) {
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
        const commonProperties = {
            Name: {
                title: {}
            },
            Status: {
                select: {
                    options: [
                        {
                            name: 'Not Started',
                            color: 'gray'
                        },
                        {
                            name: 'In Progress',
                            color: 'blue'
                        },
                        {
                            name: 'Completed',
                            color: 'green'
                        },
                        {
                            name: 'On Hold',
                            color: 'orange'
                        }
                    ]
                }
            },
            Priority: {
                select: {
                    options: [
                        {
                            name: 'Low',
                            color: 'gray'
                        },
                        {
                            name: 'Medium',
                            color: 'yellow'
                        },
                        {
                            name: 'High',
                            color: 'red'
                        }
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
                    text: {
                        content: 'PARA - Projects'
                    }
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
                    text: {
                        content: 'PARA - Areas'
                    }
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
                    text: {
                        content: 'PARA - Resources'
                    }
                }
            ],
            properties: {
                ...commonProperties,
                'Category': {
                    select: {
                        options: [
                            {
                                name: 'Article',
                                color: 'blue'
                            },
                            {
                                name: 'Book',
                                color: 'green'
                            },
                            {
                                name: 'Course',
                                color: 'orange'
                            },
                            {
                                name: 'Video',
                                color: 'red'
                            },
                            {
                                name: 'Podcast',
                                color: 'purple'
                            },
                            {
                                name: 'Other',
                                color: 'gray'
                            }
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
                    text: {
                        content: 'PARA - Archive'
                    }
                }
            ],
            properties: {
                ...commonProperties,
                'Original Category': {
                    select: {
                        options: [
                            {
                                name: 'Project',
                                color: 'blue'
                            },
                            {
                                name: 'Area',
                                color: 'green'
                            },
                            {
                                name: 'Resource',
                                color: 'orange'
                            }
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
async function populateInitialData(notion, databaseIds, personaData, userId) {
    // Add current projects from persona data to Projects database
    if (personaData.currentProjects && Array.isArray(personaData.currentProjects)) {
        for (const project of personaData.currentProjects){
            await notion.pages.create({
                parent: {
                    database_id: databaseIds.projects
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: project
                                }
                            }
                        ]
                    },
                    Status: {
                        select: {
                            name: 'Not Started'
                        }
                    },
                    Priority: {
                        select: {
                            name: 'Medium'
                        }
                    },
                    UserId: {
                        rich_text: [
                            {
                                text: {
                                    content: userId
                                }
                            }
                        ]
                    }
                }
            });
        }
    }
    // Add areas based on occupation and interests
    if (personaData.occupation) {
        await notion.pages.create({
            parent: {
                database_id: databaseIds.areas
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: 'Work'
                            }
                        }
                    ]
                },
                Responsibility: {
                    rich_text: [
                        {
                            text: {
                                content: personaData.occupation
                            }
                        }
                    ]
                },
                UserId: {
                    rich_text: [
                        {
                            text: {
                                content: userId
                            }
                        }
                    ]
                }
            }
        });
    }
    // Add standard life areas
    const standardAreas = [
        'Health',
        'Finances',
        'Relationships',
        'Personal Development'
    ];
    for (const area of standardAreas){
        await notion.pages.create({
            parent: {
                database_id: databaseIds.areas
            },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: area
                            }
                        }
                    ]
                },
                UserId: {
                    rich_text: [
                        {
                            text: {
                                content: userId
                            }
                        }
                    ]
                }
            }
        });
    }
    // Add resources based on interests
    if (personaData.interests && Array.isArray(personaData.interests)) {
        for (const interest of personaData.interests){
            await notion.pages.create({
                parent: {
                    database_id: databaseIds.resources
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: `Resources on ${interest}`
                                }
                            }
                        ]
                    },
                    Category: {
                        select: {
                            name: 'Other'
                        }
                    },
                    UserId: {
                        rich_text: [
                            {
                                text: {
                                    content: userId
                                }
                            }
                        ]
                    }
                }
            });
        }
    }
}
const __TURBOPACK__default__export__ = handler;
}}),
"[project]/node_modules/next/dist/esm/server/route-modules/pages-api/module.compiled.js [api] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    if ("TURBOPACK compile-time truthy", 1) {
        module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/pages-api.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api.runtime.dev.js, cjs)");
    } else {
        "TURBOPACK unreachable";
    }
} //# sourceMappingURL=module.compiled.js.map
}}),
"[project]/node_modules/next/dist/esm/server/route-kind.js [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "RouteKind": (()=>RouteKind)
});
var RouteKind = /*#__PURE__*/ function(RouteKind) {
    /**
   * `PAGES` represents all the React pages that are under `pages/`.
   */ RouteKind["PAGES"] = "PAGES";
    /**
   * `PAGES_API` represents all the API routes under `pages/api/`.
   */ RouteKind["PAGES_API"] = "PAGES_API";
    /**
   * `APP_PAGE` represents all the React pages that are under `app/` with the
   * filename of `page.{j,t}s{,x}`.
   */ RouteKind["APP_PAGE"] = "APP_PAGE";
    /**
   * `APP_ROUTE` represents all the API routes and metadata routes that are under `app/` with the
   * filename of `route.{j,t}s{,x}`.
   */ RouteKind["APP_ROUTE"] = "APP_ROUTE";
    /**
   * `IMAGE` represents all the images that are generated by `next/image`.
   */ RouteKind["IMAGE"] = "IMAGE";
    return RouteKind;
}({}); //# sourceMappingURL=route-kind.js.map
}}),
"[project]/node_modules/next/dist/esm/build/templates/helpers.js [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * Hoists a name from a module or promised module.
 *
 * @param module the module to hoist the name from
 * @param name the name to hoist
 * @returns the value on the module (or promised module)
 */ __turbopack_context__.s({
    "hoist": (()=>hoist)
});
function hoist(module, name) {
    // If the name is available in the module, return it.
    if (name in module) {
        return module[name];
    }
    // If a property called `then` exists, assume it's a promise and
    // return a promise that resolves to the name.
    if ('then' in module && typeof module.then === 'function') {
        return module.then((mod)=>hoist(mod, name));
    }
    // If we're trying to hoise the default export, and the module is a function,
    // return the module itself.
    if (typeof module === 'function' && name === 'default') {
        return module;
    }
    // Otherwise, return undefined.
    return undefined;
} //# sourceMappingURL=helpers.js.map
}}),
"[project]/node_modules/next/dist/esm/build/templates/pages-api.js { INNER_PAGE => \"[project]/pages/api/create-para-framework.ts [api] (ecmascript)\" } [api] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "default": (()=>__TURBOPACK__default__export__),
    "routeModule": (()=>routeModule)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$modules$2f$pages$2d$api$2f$module$2e$compiled$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/route-modules/pages-api/module.compiled.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$kind$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/route-kind.js [api] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$build$2f$templates$2f$helpers$2e$js__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/build/templates/helpers.js [api] (ecmascript)");
// Import the userland code.
var __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$create$2d$para$2d$framework$2e$ts__$5b$api$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/pages/api/create-para-framework.ts [api] (ecmascript)");
;
;
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$build$2f$templates$2f$helpers$2e$js__$5b$api$5d$__$28$ecmascript$29$__["hoist"])(__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$create$2d$para$2d$framework$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, 'default');
const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$build$2f$templates$2f$helpers$2e$js__$5b$api$5d$__$28$ecmascript$29$__["hoist"])(__TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$create$2d$para$2d$framework$2e$ts__$5b$api$5d$__$28$ecmascript$29$__, 'config');
const routeModule = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$modules$2f$pages$2d$api$2f$module$2e$compiled$2e$js__$5b$api$5d$__$28$ecmascript$29$__["PagesAPIRouteModule"]({
    definition: {
        kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$route$2d$kind$2e$js__$5b$api$5d$__$28$ecmascript$29$__["RouteKind"].PAGES_API,
        page: "/api/create-para-framework",
        pathname: "/api/create-para-framework",
        // The following aren't used in production.
        bundlePath: '',
        filename: ''
    },
    userland: __TURBOPACK__imported__module__$5b$project$5d2f$pages$2f$api$2f$create$2d$para$2d$framework$2e$ts__$5b$api$5d$__$28$ecmascript$29$__
}); //# sourceMappingURL=pages-api.js.map
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__382cab06._.js.map