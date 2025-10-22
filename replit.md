# AI Executive Assistant - Replit Project Documentation

## Project Overview
AI-powered executive assistant for Matt Vaadi that automates daily briefings, email management, calendar intelligence, and CRM workflows. Built with React, Express, PostgreSQL, and Google Workspace integrations.

## Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Integrations**: Gmail, Google Calendar, Google Drive (via Replit connectors)
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

## Google Integrations

### Gmail Connector
- Connection ID: `conn_google-mail_01K84925K17RK5VVMC4A1NFSYY`
- Service: `server/services/google/gmail.ts`
- Functions: `fetchRecentEmails()`, `sendEmail()`
- Scopes: read, labels, send, metadata

### Calendar Connector
- Connection ID: `conn_google-calendar_01K849660T3PYX9HRW84FZB2ET`
- Service: `server/services/google/calendar.ts`
- Functions: `fetchTodayEvents()`, `isWithinWorkHours()`
- Scopes: events (read/write), calendar access

### Drive Connector
- Connection ID: `conn_google-drive_01K84975E8CY672F0A4GMECK73`
- Not yet implemented (planned for SOP search)

## API Routes (`server/routes.ts`)
- `GET /api/brief/today` - Daily briefing data
- `GET /api/emails` - Recent emails with priority filtering
- `POST /api/email/draft` - Generate AI draft reply
- `POST /api/email/send` - Send email via Gmail
- `GET /api/calendar/today` - Today's calendar events
- `GET /api/tasks` - User tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task status
- `GET /api/settings` - User settings
- `POST /api/settings` - Update settings

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
2. Implemented Google OAuth integration using Replit connectors
3. Built pluggable LLM service layer (Gemini, OpenAI, Anthropic)
4. Created Gmail service for email fetching and AI draft generation
5. Implemented calendar service with work hours enforcement
6. Built daily briefing endpoint aggregating all data sources
7. Set up node-cron scheduled jobs for automated workflows
8. Connected frontend to backend with React Query
9. Removed all mock data and implemented real data fetching
10. Added proper loading states and error handling

## Known Limitations
- Google Chat bot not yet implemented
- CRM integrations (Zoho, HighLevel) are stubbed
- Voice note capture not implemented
- SOP search needs pgvector embeddings
- Gifting automation (Canva, USPS) not implemented
- LinkedIn/X content workflow pending

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
- Google OAuth connectors (Gmail, Calendar, Drive)
- API keys: GEMINI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY
- SESSION_SECRET for Express sessions

## Development Commands
- `npm run dev` - Start development server (runs automatically via workflow)
- `npm run build` - Build for production
- Database migrations handled automatically via Drizzle
