# AI Habit Coach - Product Requirements Document

## Overview

AI Habit Coach is an agent-driven habit tracking application that combines traditional habit management with AI-powered coaching. Users can create and track daily/weekly habits, monitor streaks, set personal goals, and interact with an AI coach that provides personalized habit suggestions and accountability support. This is a feature-rich proof of concept demonstrating the power of AI-assisted personal development.

## Target Audience

**Primary Users:** Personal users wanting to build better habits and achieve their goals.

**Key Pain Points:**
- Difficulty maintaining consistency with habits
- Lack of personalized guidance on which habits to adopt
- No accountability partner to keep them on track
- Generic habit trackers that don't adapt to individual goals

## Core Features

### 1. Habit Management (CRUD + Tracking)
- Create habits with name, description, and frequency (daily or weekly)
- Edit and delete existing habits
- Mark habits as complete for the current period
- Visual indicators for habit completion status

### 2. Streak Tracking
- Automatic streak calculation for consecutive completions
- Streak display on habit cards
- Streak recovery grace period (optional)
- Milestone celebrations for streak achievements

### 3. Goal Setting
- Create personal goals with descriptions
- Link habits to specific goals
- Track goal progress based on associated habit completion
- Goal categories (health, productivity, learning, etc.)

### 4. AI Habit Suggestions
- Agent analyzes existing habits and goals
- Provides personalized habit recommendations
- Explains reasoning behind suggestions
- Users can accept suggestions to create new habits

### 5. Accountability Chat
- Conversational AI coach interface
- Discusses progress, challenges, and motivation
- Hybrid storage: key insights saved, full history session-based
- Proactive check-ins based on habit completion patterns
- Contextual awareness of user's habits, goals, and streaks

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **AI/LLM**: OpenRouter API
- **Hosting**: Vercel

## Architecture

Full-stack Next.js application using the App Router pattern:

```
src/
├── app/
│   ├── (auth)/           # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/      # Protected routes
│   │   ├── habits/       # Habit management
│   │   ├── goals/        # Goal setting
│   │   └── coach/        # AI chat interface
│   ├── api/              # API routes
│   │   ├── habits/
│   │   ├── goals/
│   │   └── chat/
│   └── layout.tsx
├── components/
│   ├── ui/               # Shadcn components
│   ├── habits/           # Habit-specific components
│   ├── goals/            # Goal-specific components
│   └── chat/             # Chat interface components
├── lib/
│   ├── db/               # Drizzle schema and client
│   ├── ai/               # OpenRouter integration
│   └── utils/            # Utility functions
└── actions/              # Server actions
```

## Data Model

### Users (managed by Clerk)
- id (from Clerk)
- email
- name
- createdAt

### Habits
- id: uuid
- userId: string (Clerk user ID)
- name: string
- description: string (nullable)
- frequency: enum ('daily', 'weekly')
- createdAt: timestamp
- updatedAt: timestamp
- isActive: boolean

### HabitCompletions
- id: uuid
- habitId: uuid (FK)
- completedAt: timestamp
- periodStart: date (for weekly habits)

### Goals
- id: uuid
- userId: string
- name: string
- description: string (nullable)
- category: string (nullable)
- targetDate: date (nullable)
- isCompleted: boolean
- createdAt: timestamp
- updatedAt: timestamp

### HabitGoals (junction table)
- habitId: uuid (FK)
- goalId: uuid (FK)

### ChatInsights (hybrid storage)
- id: uuid
- userId: string
- insight: string
- context: jsonb (related habits/goals)
- createdAt: timestamp

## UI/UX Requirements

### Design System
- Use Shadcn/ui components consistently
- Dark/light mode support
- Responsive design (mobile-first)
- Clean, modern aesthetic with good whitespace

### Key Screens

**1. Dashboard**
- Overview of today's habits
- Current streaks summary
- Quick-complete buttons
- Progress toward goals

**2. Habits Page**
- List of all habits (filterable by frequency)
- Add/edit habit modal
- Habit cards showing: name, streak, completion status
- Swipe or click to complete

**3. Goals Page**
- Goal cards with progress indicators
- Create/edit goal modal
- Associated habits display
- Category filters

**4. Coach/Chat Page**
- Chat interface with AI coach
- Suggested prompts for getting started
- Context panel showing relevant habits/goals
- Insight history sidebar

### Interactions
- Smooth animations for completions
- Toast notifications for actions
- Optimistic UI updates
- Loading states for AI responses

## Security Considerations

- Clerk handles authentication and session management
- All API routes protected with Clerk middleware
- User data isolation (users can only access their own data)
- Environment variables for API keys (never exposed to client)
- Input validation with Zod schemas

## Third-Party Integrations

### Clerk
- User authentication
- Session management
- User profile management

### Neon PostgreSQL
- Serverless Postgres database
- Connection pooling
- Auto-scaling

### OpenRouter
- LLM API access
- Model selection via environment variable
- Streaming responses for chat

## Constraints & Assumptions

### Constraints
- Proof of concept scope - not production-hardened
- Single user focus (no team/sharing features)
- No mobile app (responsive web only)

### Assumptions
- Users have modern browsers
- Environment variables configured correctly
- Clerk and Neon accounts set up
- OpenRouter API key available

## Success Criteria

1. **Authentication**: Users can sign up, sign in, and sign out via Clerk
2. **Habit CRUD**: Full create, read, update, delete functionality for habits
3. **Habit Types**: Support for both daily and weekly habits
4. **Completions**: Users can mark habits complete and see visual feedback
5. **Streaks**: Accurate streak calculation and display
6. **Goals**: Full goal management with habit associations
7. **AI Suggestions**: Agent provides relevant habit suggestions
8. **Accountability Chat**: Conversational AI with context awareness
9. **Insight Storage**: Key insights from chats are persisted
10. **Polished UI**: Clean, responsive design with Shadcn/ui components

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize Next.js project with TypeScript and Tailwind",
    "steps": [
      "Run npx create-next-app with TypeScript, Tailwind, App Router",
      "Verify project runs with npm run dev",
      "Clean up boilerplate files"
    ],
    "passes": true
  },
  {
    "category": "setup",
    "description": "Install and configure Shadcn/ui",
    "steps": [
      "Initialize shadcn/ui with npx shadcn@latest init",
      "Install core components: button, card, input, dialog, toast",
      "Verify components render correctly"
    ],
    "passes": true
  },
  {
    "category": "setup",
    "description": "Configure Clerk authentication",
    "steps": [
      "Install @clerk/nextjs package",
      "Add Clerk provider to app layout",
      "Create middleware.ts for route protection",
      "Create sign-in and sign-up pages",
      "Verify authentication flow works"
    ],
    "passes": false
  },
  {
    "category": "setup",
    "description": "Set up Drizzle ORM with Neon PostgreSQL",
    "steps": [
      "Install drizzle-orm and drizzle-kit",
      "Create database schema file with all tables",
      "Configure drizzle.config.ts",
      "Run initial migration",
      "Verify database connection"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Build dashboard layout and navigation",
    "steps": [
      "Create main dashboard layout with sidebar/header",
      "Add navigation links: Dashboard, Habits, Goals, Coach",
      "Show user info from Clerk in header",
      "Add sign-out button",
      "Make layout responsive"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement habit creation and listing",
    "steps": [
      "Create habits API route (GET, POST)",
      "Build habit list component with cards",
      "Create add habit dialog/modal",
      "Implement form with name, description, frequency",
      "Verify habits are saved and displayed"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement habit editing and deletion",
    "steps": [
      "Add edit button to habit cards",
      "Create edit habit dialog with pre-filled form",
      "Implement PUT API route for updates",
      "Add delete button with confirmation",
      "Implement DELETE API route",
      "Verify edit and delete work correctly"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Build habit completion functionality",
    "steps": [
      "Add completion toggle/button to habit cards",
      "Create completions API route",
      "Implement logic for daily vs weekly completion checks",
      "Show completion status visually on cards",
      "Add optimistic UI updates",
      "Verify completions are recorded correctly"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement streak calculation and display",
    "steps": [
      "Create streak calculation utility function",
      "Handle daily streak logic (consecutive days)",
      "Handle weekly streak logic (consecutive weeks)",
      "Display streak count on habit cards",
      "Add streak milestone indicators",
      "Verify streak calculations are accurate"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Build goals management page",
    "steps": [
      "Create goals API routes (CRUD)",
      "Build goals list page with cards",
      "Create add/edit goal dialogs",
      "Implement goal form with name, description, category, target date",
      "Verify goals CRUD works correctly"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Link habits to goals",
    "steps": [
      "Add goal selection to habit form",
      "Create habit-goal association API",
      "Display associated habits on goal cards",
      "Show goal progress based on habit completions",
      "Verify linking works correctly"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Build AI chat interface",
    "steps": [
      "Create coach/chat page layout",
      "Build chat message components",
      "Create chat input with send button",
      "Add message history display",
      "Style for good UX with loading states"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Integrate OpenRouter for AI responses",
    "steps": [
      "Create OpenRouter client utility",
      "Build chat API route with streaming",
      "Implement system prompt with user context",
      "Pass habits, goals, and streaks to AI",
      "Verify AI responds with relevant context"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Implement AI habit suggestions",
    "steps": [
      "Add suggestion request to chat or dedicated button",
      "Create prompt for habit suggestions",
      "Display suggestions in chat or modal",
      "Add 'Accept suggestion' button to create habit",
      "Verify suggestions are relevant to goals"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Build chat insight storage",
    "steps": [
      "Create insights API route",
      "Implement insight extraction from conversations",
      "Store key insights in database",
      "Display insight history in sidebar",
      "Verify insights are saved and retrieved"
    ],
    "passes": false
  },
  {
    "category": "feature",
    "description": "Build dashboard overview page",
    "steps": [
      "Create dashboard home page",
      "Show today's habits with quick complete",
      "Display streak summary stats",
      "Show goal progress overview",
      "Add motivational message from AI",
      "Verify all data displays correctly"
    ],
    "passes": false
  },
  {
    "category": "styling",
    "description": "Polish UI with animations and dark mode",
    "steps": [
      "Add dark/light mode toggle",
      "Implement smooth completion animations",
      "Add hover and focus states",
      "Polish responsive design for mobile",
      "Add loading skeletons",
      "Verify UI is polished and consistent"
    ],
    "passes": false
  },
  {
    "category": "styling",
    "description": "Add toast notifications and error handling",
    "steps": [
      "Configure toast provider",
      "Add success toasts for actions",
      "Add error toasts for failures",
      "Implement error boundaries",
      "Verify notifications appear correctly"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "End-to-end verification of all features",
    "steps": [
      "Test complete auth flow",
      "Test habit CRUD and completions",
      "Test streak calculations",
      "Test goal management and linking",
      "Test AI chat and suggestions",
      "Verify all features work together"
    ],
    "passes": false
  }
]
```

---

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Find next task with `"passes": false`
3. Complete all steps for that task
4. Verify in browser using agent-browser
5. Update task to `"passes": true`
6. Log completion in `activity.md`
7. Repeat until all tasks pass

**Important:** Only modify the `passes` field. Do not remove or rewrite tasks.

---

## Completion Criteria
All tasks marked with `"passes": true`
