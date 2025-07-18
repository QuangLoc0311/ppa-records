# Pickleball Match Tracker

An AI-powered pickleball match tracking system with intelligent team balancing and ELO-based scoring.

## Features

### 👥 Player Management
- Add and delete players
- Each player has: name, age, avatar URL, score, and gender
- Visual player cards with avatars and stats

### 🧠 AI Match Generator
- Intelligent team balancing based on player scores
- Avoids repeated team pairings from recent matches
- Creates balanced 2v2 matches with score difference within 200 points

### 📝 Match Recording
- Input final scores after each match
- Real-time score validation
- Automatic winner determination

### 📈 Score Recalculation
- ELO-like rating system for fair matchmaking
- Automatic score updates after each match
- Bonus points for close matches
- Improves future team balancing

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **UI Components**: Custom component library

## Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ppa-records
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Create the following tables in your Supabase database:

#### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  score FLOAT DEFAULT 1000
);
```

#### Matches Table
```sql
create table matches (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp default now(),
  team1_score int,
  team2_score int
);
```

#### Match Players (many to many)
```sql
CREATE TABLE match_players (
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team INTEGER CHECK (team IN (1, 2)),
  CONSTRAINT match_player_pk PRIMARY KEY (match_id, player_id)
);
```

### 4. Environment Variables

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start the development server
```bash
npm run dev
```

## Usage

### Adding Players
1. Navigate to the "Players" tab
2. Click "Add Player"
3. Fill in the player details (name, age, gender, optional avatar URL)
4. Click "Add Player" to save

### Generating Matches
1. Navigate to the "Match Generator" tab
2. Click "Generate Match" to create balanced teams
3. Review the generated teams and their total scores
4. Click "Start Match" to begin the match

### Recording Match Results
1. Navigate to the "Match Recording" tab
2. Select an active match from the list
3. Enter the final scores for both teams
4. Click "Save Result" to record the outcome and update player scores

## Architecture

### Services Layer
The application uses a services layer to separate business logic from UI components:

- **playerService**: Handles all player-related database operations
- **matchService**: Manages match creation, updates, and queries
- **scoreService**: Contains ELO-like scoring algorithms and team balancing logic

This architecture provides:
- Better separation of concerns
- Reusable business logic
- Easier testing and maintenance
- Cleaner component code

## Algorithm Details

### Team Balancing
- Players are sorted by score (highest to lowest)
- Teams are created by alternating players to maintain balance
- Score difference is kept within 200 points when possible
- Recent team pairings are avoided to ensure variety

### ELO Rating System
- K-factor of 32 for rating changes
- Expected win probability calculated based on team score differences
- Actual result: 1 for win, 0 for loss
- Close matches (score difference ≤ 2) receive a 5-point bonus
- Minimum score is capped at 100

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── PlayerManagement.tsx
│   ├── MatchGenerator.tsx
│   └── MatchRecording.tsx
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
├── services/
│   ├── playerService.ts   # Player-related API operations
│   ├── matchService.ts    # Match-related API operations
│   ├── scoreService.ts    # Score calculation logic
│   └── index.ts           # Service exports
├── types/
│   └── index.ts           # TypeScript type definitions
└── App.tsx                # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
