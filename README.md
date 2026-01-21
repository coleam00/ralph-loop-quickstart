# AI Habit Coach

AI Habit Coach is a full-stack habit tracking application with AI-powered coaching. Built with Next.js 14, it combines traditional habit management (create, track, streaks) with an AI coach that provides personalized suggestions and accountability support. The AI understands your habits and goals, offers relevant habit recommendations, and extracts insights from your conversations.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (we use [Neon](https://neon.tech))
- [Clerk](https://clerk.com) account for authentication
- [OpenRouter](https://openrouter.ai) API key for AI features

### 1. Clone and Install

```bash
git clone <repo-url>
cd ralph-loop-quickstart
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Neon PostgreSQL)
POSTGRES_URL=postgresql://...

# AI (OpenRouter)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-sonnet-4
```

### 3. Set Up Database

```bash
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in to start tracking habits.

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL (Neon), Drizzle ORM |
| Auth | Clerk |
| AI | OpenRouter API |

### Codebase Structure

```
src/
├── app/
│   ├── (auth)/                 # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/            # Protected routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── habits/             # Habit management
│   │   ├── goals/              # Goal setting
│   │   └── coach/              # AI chat interface
│   ├── api/                    # API routes
│   │   ├── habits/             # Habit CRUD + completions
│   │   ├── goals/              # Goal CRUD
│   │   ├── chat/               # AI chat endpoint
│   │   ├── suggestions/        # AI habit suggestions
│   │   └── insights/           # Chat insight storage
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Landing page
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── layout/                 # Header, sidebar
│   ├── habits/                 # Habit cards, forms
│   ├── goals/                  # Goal cards, forms
│   ├── chat/                   # Chat interface
│   └── dashboard/              # Dashboard widgets
├── lib/
│   ├── db/                     # Drizzle schema and client
│   │   ├── schema.ts           # Database tables
│   │   └── index.ts            # DB connection
│   └── utils.ts                # Utility functions
└── actions/                    # Server actions
```

### Data Model

- **Habits** - Name, description, frequency (daily/weekly), streaks
- **HabitCompletions** - Tracks when habits are completed
- **Goals** - User goals with categories and target dates
- **HabitGoals** - Links habits to goals
- **ChatInsights** - AI-extracted insights from conversations

## Features

- **Habit Tracking** - Create daily/weekly habits, mark complete, view streaks
- **Goal Management** - Set goals and link habits to them
- **AI Coach** - Chat interface with context-aware responses
- **AI Suggestions** - Get personalized habit recommendations based on your goals
- **Insight Extraction** - Key insights from chats are saved automatically
- **Dark/Light Mode** - Modern blue-tinted dark theme

## Scripts

```bash
npm run dev        # Start development server
npm run db:push    # Push schema to database
npm run db:studio  # Open Drizzle Studio
npm run lint       # Run ESLint
```

## Related

See [ralph-guide.md](./ralph-guide.md) for documentation on the Ralph Wiggum autonomous development method used to build this project.
