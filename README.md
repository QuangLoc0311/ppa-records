# Pickleball Match Tracker

A modern, mobile-first web application for managing pickleball matches with AI-powered matchmaking. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Player Management**: Add, edit, and manage player profiles with skill scores
- **AI Match Generator**: Advanced algorithm considering fatigue, gender balance, and session planning
- **Match Recording**: Record match results with automatic score recalculation
- **Statistics**: Track player performance and match history
- **Mobile-First Design**: Optimized for mobile devices with responsive layout

## 🧠 Advanced Matchmaking Algorithm

The AI-powered matchmaking algorithm ensures fair, balanced, and engaging matches by considering multiple factors:

### 🎯 **Core Benefits**

#### **1. Fair Team Balance**
- **Skill-Based Matching**: Teams are balanced based on player skill scores (0-10 scale)
- **Dynamic Scoring**: Uses ELO-like rating system that adapts to player performance
- **Optimal Combinations**: Evaluates all possible team combinations to find the most balanced matchups

#### **2. Player Fatigue Management**
- **Consecutive Match Prevention**: Prevents players from playing too many consecutive matches
- **Rest Periods**: Ensures players get adequate rest between matches
- **Gender-Specific Fatigue**: Different fatigue factors for male (0.2) and female (0.3) players
- **Small Pool Optimization**: Adapts rules for small groups (5-6 players) vs larger groups

#### **3. Session Planning Intelligence**
- **Multi-Match Optimization**: Plans entire sessions, not just individual matches
- **Player Rotation**: Ensures all players participate equally throughout the session
- **Team Variety**: Minimizes repeated team partnerships to keep matches fresh
- **Time Management**: Automatically calculates optimal number of matches based on session duration

#### **4. Smart Player Selection**
- **Priority-Based Selection**: Players who haven't played get highest priority
- **Consecutive Match Limits**: Maximum 2-3 consecutive matches depending on pool size
- **Forced Rotation**: For small pools, implements forced player rotation between matches
- **Balance Override**: Team balance takes precedence over other factors when necessary

### 🔧 **Algorithm Features**

#### **Weighted Scoring System**
- **Consecutive Match Penalty**: Highest priority (1000-2000x multiplier)
- **Team Balance Score**: Second priority (100x multiplier for score differences)
- **Fatigue Penalty**: Low priority (0.5x multiplier)
- **No Rest Penalty**: Low priority (0.3x multiplier)
- **Team Repetition Penalty**: Moderate priority (10x multiplier)

#### **Adaptive Behavior**
- **Small Pool Logic**: Relaxes rest rules for 5-6 players while maintaining fairness
- **Large Pool Logic**: Stricter consecutive match limits for 7+ players
- **Dynamic Match Count**: Calculates optimal matches based on session duration and match length
- **Fallback Mechanisms**: Graceful handling when ideal conditions can't be met

#### **Real-Time Optimization**
- **Live Score Updates**: Player ratings adjust after each match
- **Performance Tracking**: Monitors player participation and performance
- **Session Continuity**: Maintains session state across multiple matches
- **Progress Tracking**: Shows current match and session progress

### 📊 **Algorithm Performance**

The algorithm has been optimized for:
- **Fairness**: Ensures balanced teams and equal player participation
- **Engagement**: Keeps matches competitive and interesting
- **Efficiency**: Fast generation even with complex constraints
- **Flexibility**: Adapts to different group sizes and session lengths
- **Reliability**: Handles edge cases and provides fallback options

## 📱 Mobile-First Design

This application is built with mobile-first principles using Tailwind CSS:

### Responsive Breakpoints
- **Mobile**: Default (320px+)
- **Small**: 640px+ (`sm:`)
- **Medium**: 768px+ (`md:`)
- **Large**: 1024px+ (`lg:`)
- **Extra Large**: 1280px+ (`xl:`)

### Mobile Optimizations
- Touch-friendly buttons (minimum 44px height)
- Responsive navigation with hamburger menu
- Optimized form inputs (16px font size to prevent zoom on iOS)
- Mobile-friendly spacing and typography
- Safe area support for notched devices

### Key Mobile Features
- **Sticky Header**: Navigation stays accessible while scrolling
- **Collapsible Menu**: Mobile navigation with smooth animations
- **Responsive Cards**: Adapt to different screen sizes
- **Touch Targets**: All interactive elements meet accessibility guidelines

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.x (Mobile-first)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ppa-records
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Players Table
```sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  score DECIMAL(3,1) DEFAULT 5.0 CHECK (score >= 0.0 AND score <= 10.0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_group UNIQUE (user_id, group_id)
);
```

### Groups Table
```sql
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  host_player_id UUID, -- Will reference players later
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')) DEFAULT 'draft',
  session_duration_minutes INTEGER NOT NULL,
  match_duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Matches Table
```sql
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  match_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team1_score INTEGER,
  team2_score INTEGER,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled'
);
```

### Match Players Table
```sql
CREATE TABLE match_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team INTEGER CHECK (team IN (1, 2)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Relationship
```sql
ALTER TABLE players
  ADD CONSTRAINT unique_user_group UNIQUE (user_id, group_id);
```

### Policies
```sql
CREATE POLICY "Select own user"
ON users
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Update own user"
ON users
FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Select groups I belong to"
ON groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM players
    WHERE players.group_id = groups.id
      AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Insert groups"
ON groups
FOR INSERT
WITH CHECK (true); -- Allow group creation (could be limited further if needed)

CREATE POLICY "Update groups I belong to"
ON groups
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM players
    WHERE players.group_id = groups.id
      AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Delete groups I belong to"
ON groups
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM players
    WHERE players.group_id = groups.id
      AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Select players in my groups"
ON players
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM players AS me
    WHERE me.group_id = players.group_id
      AND me.user_id = auth.uid()
  )
);

CREATE POLICY "Insert player into my group"
ON players
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM players AS me
    WHERE me.group_id = players.group_id
      AND me.user_id = auth.uid()
  )
);

CREATE POLICY "Select sessions in my groups"
ON sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM players
    WHERE players.group_id = sessions.group_id
      AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Select matches in my groups"
ON matches
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM players
    JOIN sessions ON sessions.group_id = players.group_id
    WHERE sessions.id = matches.session_id
      AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Select match_players in my groups"
ON match_players
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM players
    JOIN matches ON matches.id = match_players.match_id
    JOIN sessions ON sessions.id = matches.session_id
    WHERE sessions.group_id = players.group_id
      AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Only host player can create session"
ON sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM groups
    JOIN players
      ON players.id = groups.host_player_id
    WHERE groups.id = sessions.group_id
      AND players.user_id = auth.uid()
  )
);
```

## 📁 Supabase Storage Setup

### 1. Create Storage Bucket
In your Supabase dashboard, go to Storage and create a new bucket:
- **Bucket name**: `images`
- **Public bucket**: ✅ (checked)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`

### 2. Storage Policies
Add the following RLS policies to your `images` bucket:

**Allow public read access:**
```sql
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
```

**Allow public uploads (no authentication required):**
```sql
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
```

**Allow public updates:**
```sql
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
```

**Allow public deletes:**
```sql
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');
```

**Note**: These policies allow public access to the storage bucket. If you plan to add authentication later, you should update these policies to be more restrictive.

### 3. Folder Structure
The app will automatically create the following folder structure:
```
images/
├── avatars/          # Player profile pictures
└── ...
```

## 🎯 Usage

### Player Management
1. Navigate to the "Players" tab
2. Click "Add Player" to create new player profiles
3. Set initial skill scores (default: 5.0, range: 0.0-10.0)
4. Edit or delete players as needed

### Match Generation
1. Go to the "Match Generator" tab
2. Configure session parameters:
   - Session duration (minutes)
   - Match duration (minutes)
3. Click "Generate Session" to create multiple matches
4. Review the generated match schedule

### Match Recording
1. Visit the "Match Recording" tab
2. Generate a new match or select from existing ones
3. Record final scores for both teams
4. Save results to update player scores automatically

## 🎨 Styling Guidelines

### Mobile-First CSS Classes
```css
/* Responsive spacing */
.space-mobile { @apply space-y-4 sm:space-y-6; }
.gap-mobile { @apply gap-3 sm:gap-4; }

/* Responsive text */
.text-responsive { @apply text-sm sm:text-base; }
.text-responsive-lg { @apply text-base sm:text-lg; }

/* Mobile-friendly grid */
.grid-mobile { @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3; }
```

### Component Structure
- Use `flex-col sm:flex-row` for responsive layouts
- Apply `w-full sm:w-auto` for responsive buttons
- Use `text-sm sm:text-base` for responsive typography
- Implement `p-4 sm:p-6` for responsive padding

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── PlayerManagement.tsx
│   ├── MatchGenerator.tsx
│   ├── MatchRecording.tsx
│   └── MatchCard.tsx   # Reusable match display
├── pages/              # Page components
├── services/           # API service layer
├── utils/              # Business logic utilities
├── types/              # TypeScript type definitions
└── lib/                # Third-party library configs
```

### Adding New Components
1. Create component in `src/components/`
2. Use mobile-first Tailwind classes
3. Test on mobile devices
4. Add responsive breakpoints as needed

### Mobile Testing
- Test on actual mobile devices
- Use browser dev tools mobile emulation
- Verify touch interactions work properly
- Check performance on slower devices

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Deploy to Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 📱 Mobile Performance Tips

1. **Optimize Images**: Use WebP format and proper sizing
2. **Minimize Bundle Size**: Code splitting and lazy loading
3. **Touch Interactions**: Ensure 44px minimum touch targets
4. **Loading States**: Provide feedback for async operations
5. **Offline Support**: Consider PWA features for better UX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow mobile-first design principles
4. Test on mobile devices
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with details

---

Built with ❤️ for the pickleball community
