# AI Executive Assistant for Matt Vaadi

A production-ready AI-powered executive assistant that automates daily briefings, email management, calendar intelligence, and CRM workflows.

## Features

### Core Functionality
- **Daily Briefing Dashboard**: Morning brief at 7:30 AM ET with calendar, priority emails, tasks, and CRM items
- **Email Management**: AI-powered email triage, classification, and draft generation with tone matching
- **Calendar Intelligence**: Work hours enforcement (8 AM-4 PM ET), meeting buffers, and conflict detection
- **Task Management**: Track and manage tasks from multiple sources
- **CRM Integration**: Pipeline tracking with stale deal alerts
- **Scheduled Jobs**: Automated daily briefs, weekly scorecards, and pipeline snapshots

### Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon) via Replit
- **Auth**: Google OAuth 2.0 (Gmail, Calendar, Drive)
- **LLM**: Pluggable layer with Gemini (default), OpenAI, and Anthropic
- **Jobs**: node-cron for scheduled tasks

## Setup Instructions

### Prerequisites
- Replit account with Google Gmail, Calendar, and Drive connectors authorized
- API keys: `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` (optional), `OPENAI_API_KEY` (optional)

### Environment Variables
The following secrets are already configured in Replit Secrets:
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API key
- `ANTHROPIC_API_KEY`: Anthropic Claude API key  
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `SESSION_SECRET`: Session encryption key
- `LLM_PROVIDER`: Default LLM provider (default: 'gemini')

### Installation
```bash
# Install dependencies
npm install

# Run database migrations (already completed)
# Tables created: users, oauth_tokens, settings, tasks, contacts, pipelines, events_cache, gifts, posts, sops, email_rules

# Start the development server
npm run dev
```

The app will be available at http://0.0.0.0:5000

## Usage

### Daily Briefing
Access the morning brief dashboard at the home page. It shows:
- Today's calendar events
- Top 10 priority emails
- Pending tasks
- Active CRM deals
- Metrics overview

### Email Management
Navigate to Communications to:
- View and triage emails from Gmail
- Generate AI drafts with tone selection (casual, business casual, formal)
- Send replies directly from the interface

### Calendar
The calendar page allows you to:
- View today's schedule
- Configure work hours and meeting windows
- Set up deep work blocks
- Manage meeting buffers

### Settings
Configure:
- Work preferences (workday hours, timezone)
- Integration connections
- Email tone defaults

## API Endpoints

### Briefing
- `GET /api/brief/today` - Get daily briefing data

### Email
- `GET /api/emails?limit=20` - Fetch recent emails
- `POST /api/email/draft` - Generate AI email draft
- `POST /api/email/send` - Send email

### Calendar
- `GET /api/calendar/today` - Get today's events

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task status

### Settings
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update user settings

## Scheduled Jobs

The following cron jobs run automatically (Eastern Time):
- **Daily Briefing**: 7:30 AM - Generates morning brief
- **Weekly Scorecard**: Monday 9:00 AM - Compiles KPIs
- **Pipeline Snapshot**: Friday 3:00 PM - Reviews deals

## Architecture

### Frontend Structure
```
client/src/
├── components/        # Reusable UI components
├── pages/            # Page components
├── lib/              # Utilities and query client
└── hooks/            # Custom React hooks
```

### Backend Structure
```
server/
├── services/
│   ├── google/       # Gmail, Calendar, Drive integrations
│   └── llm.ts        # Pluggable LLM service layer
├── routes.ts         # API endpoints
├── storage.ts        # Database interface
├── scheduler.ts      # Cron jobs
└── index.ts          # Server entry point
```

## Security & Privacy
- OAuth tokens are securely managed by Replit connectors with automatic refresh
- Email content is not stored; only metadata and embeddings
- All API keys are stored in Replit Secrets
- Database uses proper foreign key constraints and cascading deletes

## Development

### Running Tests
```bash
# End-to-end tests coming soon
npm run test
```

### Code Style
- TypeScript with strict mode
- ESLint + Prettier for formatting
- Follow existing patterns in components and services

## Future Enhancements
- Google Chat bot integration
- LinkedIn and X content queue
- Gifting automation with Canva templates
- Voice note capture
- SOP search with embeddings
- CRM integrations (Zoho, HighLevel)
- Trello and Apollo integrations

## Support
For issues or questions, contact the development team or refer to the Replit documentation.
