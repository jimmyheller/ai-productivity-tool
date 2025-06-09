# AI Productivity Assistant

A Next.js application that uses AI to help users chat, organize their thoughts, and manage tasks in Notion.

## Features

- 💬 Chat with AI to discuss ideas, problems, and plans
- 🎯 **Real-time PARA Framework extraction** - Automatically categorize content into Projects, Areas, Resources, and Archives
- 🔍 Extract tasks from your conversation automatically  
- 🎙️ Voice input with transcription via Whisper API
- 🔄 **Enhanced Notion integration** for PARA methodology and task management
- ⚡ **Live sidebar** with confirmation system for extracted elements
- 🔐 Authentication with Clerk

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file based on `.env.local.example` and add your API keys:
   ```
   # Clerk Authentication (get from https://clerk.com)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # OpenAI API key for AI features
   OPENAI_API_KEY=sk_...

   # Notion API (configure via Settings page in the app)
   NOTION_TOKEN=secret_...
   
   # Important: Notion configuration is done through the app's Settings page
   # You don't need to set these in .env.local
   NOTION_DATABASE_ID=...
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## PARA Framework Setup

This app automatically extracts **PARA framework elements** from your conversations:
- **Projects**: Specific outcomes with deadlines  
- **Areas**: Ongoing responsibilities to maintain
- **Resources**: Topics for future reference
- **Archives**: Inactive items

### Notion Database Setup

To save PARA elements to Notion, create a database with these properties:

**Required:**
- `Name` (Title) - For element titles

**Optional (for rich data):**
- `Type` (Select) - PARA category options: PROJECT, AREA, RESOURCE, ARCHIVE
- `Description` (Text) - Element descriptions  
- `Priority` (Select) - Options: low, medium, high
- `Due Date` (Date) - Deadline information
- `Tags` (Multi-select) - Multiple tags per element
- `Context` (Text) - Conversation context

**Important Notes:**
- The system auto-detects your database schema and adapts accordingly
- Missing properties are gracefully skipped (won't cause errors)
- If you don't have the optional properties, the system will still work with just the `Name` field
- Property types matter: Use `Select` for Priority/Type, `Date` for Due Date, `Multi-select` for Tags

### Configuration Steps

1. **Go to Settings** in the app
2. **Add your Notion Integration Token** (create at https://notion.so/integrations)
3. **Add your Notion Database ID** (from database URL)
4. **Start chatting** - PARA elements appear automatically in the sidebar
5. **Click "Confirm"** to save elements to Notion

## How It Works

1. Sign in to access the chat interface
2. Chat with the AI assistant about your projects, ideas, and tasks
3. Click "Extract Tasks" to analyze the conversation and identify tasks
4. Review the extracted tasks in the sidebar
5. Send tasks to your Notion database with one click

## Clerk Authentication Setup

1. Create a Clerk account at https://clerk.com
2. Create a new application in the Clerk dashboard
3. Configure your authentication options (email/password, social logins, etc.)
4. Under "API Keys", copy your Publishable Key and Secret Key
5. Add these to your `.env.local` file
6. Make sure to configure your redirect URLs in the Clerk dashboard:
   - Add `http://localhost:3000/sign-in/callback` and `http://localhost:3000/sign-up/callback` for local development
   - Add your production URLs when deploying

## Notes on Notion Integration

To use the Notion integration:
1. Create a Notion integration at https://www.notion.so/my-integrations
2. Create a database in Notion with the required properties:
   - Name (title)
   - Due Date (text)
   - Priority (text)
   - Category (text)
   - UserId (text)
3. Share the database with your integration
4. Add your Notion token and database ID to your environment variables

## Technologies

- Next.js with Pages Router
- TypeScript
- OpenAI API for AI chat and task processing
- Clerk for authentication
- Notion API integration
- TailwindCSS + ShadcnUI for styling