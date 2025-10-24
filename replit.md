# AI Executive Assistant - Replit Project Documentation

## Project Overview
AI-powered executive assistant for Matt Vaadi that automates daily briefings, email management, calendar intelligence, and CRM workflows. Built with React, Express, PostgreSQL, and Google Workspace integrations.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Integrations**: Gmail, Google Calendar, Google Drive, Trello
- **LLM**: Gemini (default), OpenAI, Anthropic (pluggable)
- **Scheduling**: node-cron

## Database Schema
Complete schema in `shared/schema.ts`:
- `users`: User accounts with email, name, timezone
- `oauth_tokens`: Google OAuth tokens with refresh logic
- `settings`: User preferences (work hours, meeting windows, deep work blocks)
- `tasks`: Task tracking from multiple sources
- `contacts`: Contact information with social metadata
- `pipelines`: CRM deals from Zoho/HighLevel
- `events_cache`: Cached calendar events
- `email_rules`: Email classification rules
- `gifts`: Birthday/anniversary tracking
- `posts`: Social media content queue
- `sops`: Standard operating procedures index

## Key Features Implemented

### Daily Briefing (`/api/brief/today`)
Aggregates:
- Today's calendar events from Google Calendar
- Top 10 priority emails from Gmail
- Pending tasks
- Active CRM deals
- Metrics (meetings, emails, tasks, stale deals)

### Email Management
- Fetch recent emails with classification (priority, labels, unread status)
- Generate AI drafts with tone matching (casual internal, business casual external)
- Send emails directly through Gmail API
- Thread summary and context extraction

### Calendar Intelligence
- Fetch today's events from Google Calendar
- Enforce work hours (8 AM-4 PM ET)
- Event type detection (meeting, deep-work, buffer)
- Attendee count and location tracking

### LLM Service (`server/services/llm.ts`)
Pluggable architecture supporting:
- **Gemini** (default): Long-context, Drive docs
- **OpenAI**: GPT-4o-mini for fast responses
- **Anthropic**: Claude for complex reasoning
- Environment-based provider selection via `LLM_PROVIDER`

### Scheduled Jobs
- Daily briefing: 7:30 AM ET
- Weekly scorecard: Monday 9 AM ET
- Pipeline snapshot: Friday 3 PM ET

## Integrations

### Gmail (Custom OAuth)
- Service: `server/services/google/gmail.ts`
- OAuth: `server/services/oauth.ts`
- Functions: `fetchRecentEmails()`, `sendEmail()`
- Scopes: gmail.readonly, gmail.send, gmail.modify, gmail.labels
- Implementation: Custom OAuth flow with tokens stored in database

### Calendar (Custom OAuth)
- Service: `server/services/google/calendar.ts`
- Functions: `fetchTodayEvents()`, `isWithinWorkHours()`
- Scopes: events (read/write), calendar access
- Work Hours: 8 AM-4 PM ET enforcement

### Drive (Custom OAuth)
- Connection ID: `conn_google-drive_01K84975E8CY672F0A4GMECK73`
- Not yet implemented (planned for SOP search)

### Trello
- Service: `server/services/trello.ts`
- Authentication: API Key + Token (token-based, no OAuth)
- Functions:
  - `fetchTrelloBoards()` - Get all user boards
  - `fetchTrelloCards()` - Get cards from boards
  - `createTrelloCard()` - Create new cards
  - `updateTrelloCard()` - Update card status/details
  - `trelloCardToTask()` - Convert Trello cards to app tasks
- Sync: Bidirectional sync between Trello cards and database tasks
- Smart Features:
  - Auto-create tasks from emails (`/api/tasks/from-email`)
  - Auto-create tasks from calendar events (`/api/tasks/from-event`)

## API Routes (`server/routes.ts`)
- `GET /api/brief/today?sync=true` - Daily briefing with Trello sync
- `GET /api/emails` - Recent emails with priority filtering
- `POST /api/email/draft` - Generate AI draft reply
- `POST /api/email/send` - Send email via Gmail
- `GET /api/calendar/today` - Today's calendar events
- `GET /api/tasks?sync=true` - User tasks with optional Trello sync
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task status
- `GET /api/settings` - User settings
- `POST /api/settings` - Update settings
- `GET /api/trello/boards` - Get all Trello boards
- `GET /api/trello/boards/:boardId/lists` - Get lists for a board
- `POST /api/trello/cards` - Create Trello card and sync as task
- `PATCH /api/trello/cards/:cardId` - Update Trello card
- `POST /api/tasks/from-email` - Create task from email
- `POST /api/tasks/from-event` - Create task from calendar event
- `GET /api/oauth/authorize` - Google OAuth flow
- `GET /api/oauth/callback` - Google OAuth callback

## Frontend Pages
- **Home** (`/`): Morning brief dashboard with metrics, emails, events, tasks, deals
- **Comms** (`/comms`): Email triage and AI drafting interface
- **Calendar** (`/calendar`): Schedule view with guardrails configuration
- **Sales** (`/sales`): CRM pipeline and deal management (stub)
- **Content** (`/content`): Social media queue (stub)
- **Gifts** (`/gifts`): Birthday/anniversary tracking (stub)
- **Settings** (`/settings`): Integration management and preferences

## Work Preferences & Rules
- **Work Hours**: 8 AM to 4 PM Eastern Time (enforced by calendar service)
- **Preferred Channel**: Google Chat (not yet implemented)
- **Email Tone**: 
  - Casual for internal contacts
  - Business casual for external contacts
  - Avoid fluff, be concise and actionable
- **Proactive Support**: App detects needs and acts without waiting for instruction

## Recent Changes (Latest Session)
1. Set up complete database schema with all tables
2. Implemented custom Google OAuth integration (replaced Replit connectors for full API access)
3. Built pluggable LLM service layer (Gemini, OpenAI, Anthropic)
4. Created Gmail service with full API scopes for email management
5. Implemented calendar service with work hours enforcement
6. Built daily briefing endpoint aggregating all data sources
7. Set up node-cron scheduled jobs for automated workflows
8. Connected frontend to backend with React Query
9. Removed all mock data and implemented real data fetching
10. **Integrated Trello for task management** (Current Session):
    - Implemented Trello REST API service layer
    - Added bidirectional sync between Trello cards and database tasks
    - Created smart task creation from emails and calendar events
    - Built task creation dialog in Home.tsx with Trello sync button
    - Auto-sync Trello cards on page load and manual refresh
    - Extended storage interface for advanced task CRUD operations

## Known Limitations
- Google Chat bot not yet implemented
- CRM integrations (Zoho, HighLevel) are stubbed
- Voice note capture not implemented
- SOP search needs pgvector embeddings
- Gifting automation (Canva, USPS) not implemented
- LinkedIn/X content workflow pending
- Trello sync is one-way (Trello → Database); updates in app don't push back to Trello yet
- Perfect Week Template (calendar guardrails) not enforced yet

## Next Steps
- Implement Google Chat bot for notifications and commands
- Add CRM API integrations for Zoho and HighLevel
- Build SOP embedding and search with pgvector
- Implement gifting workflow with Canva and USPS
- Add content management for LinkedIn and X
- Create webhook listeners for Gmail and Calendar watch notifications

## Environment Requirements
- Node.js 20+
- PostgreSQL database (provided by Replit)
- Google OAuth credentials (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET)
- Trello API credentials (TRELLO_API_KEY, TRELLO_TOKEN)
- LLM API keys: GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY
- SESSION_SECRET for Express sessions

## Development Commands
- `npm run dev` - Start development server (runs automatically via workflow)
- `npm run build` - Build for production
- Database migrations handled automatically via Drizzle
