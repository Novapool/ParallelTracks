# ParallelTracks Voting Webapp

A mobile-first React voting webapp that allows users to vote on AI responses to trolley problems with real-time updates.

## Features

- 🗳️ Vote on active trolley problem questions
- 📊 Real-time vote count updates
- 🏆 AI model leaderboard
- 📱 Mobile-first responsive design
- 🔒 Duplicate vote prevention via session IDs
- ⚡ Built with Next.js 14 and Supabase

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials (already included)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

Build for production:

```bash
npm run build
```

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Project Structure

```
paralleltracks-webapp/
├── app/                      # Next.js app router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Voting page (home)
│   └── leaderboard/
│       └── page.tsx         # Leaderboard page
├── components/              # React components
│   ├── voting/             # Voting-related components
│   ├── leaderboard/        # Leaderboard components
│   └── ui/                 # Reusable UI components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and API client
│   ├── supabase/           # Supabase client and API
│   └── utils/              # Helper functions
└── types/                   # TypeScript type definitions
```

## Key Features

### Voting Flow

1. User views current active question
2. Selects one of 5 AI models to vote for
3. Vote is submitted with session ID
4. Real-time updates show vote counts
5. Duplicate votes prevented via localStorage

### Real-time Updates

- Subscribes to `votes` table for live vote counts
- Subscribes to `questions` table for new questions
- Automatic UI updates when data changes

### Mobile Optimization

- Touch-friendly buttons (minimum 48px height)
- Responsive design (mobile-first approach)
- Clear visual feedback on interactions
- Fast loading with server-side data fetching

## API Integration

The webapp integrates with the ParallelTracks Supabase backend:

- `GET /functions/v1/get_current_state` - Fetch current question and stats
- `POST /functions/v1/submit_vote` - Submit a vote
- Real-time subscriptions to `votes` and `questions` tables

## License

MIT
