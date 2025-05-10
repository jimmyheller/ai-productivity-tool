# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **Typescript**: Use strict typing with explicit type annotations
- **Imports**: Group imports by (1) external libraries, (2) internal components, (3) types, (4) styles
- **Components**: Use functional components with hooks; capitalize component filenames
- **Error Handling**: Use try/catch blocks with proper error typing (error: any)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Formatting**: Use consistent indentation (2 spaces) and trailing semicolons
- **API Responses**: Structure as { message: string, data?: any } or { error: string, details?: any }
- **State Management**: Use React hooks (useState, useEffect) for component state
- **Auth**: Wrap API routes with withAuth utility for authorization
- **Logging**: Use console.error for errors with descriptive prefixes like [AI ERROR]