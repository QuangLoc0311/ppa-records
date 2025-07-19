# Pickleball Match Tracker

A modern, mobile-first web application for managing pickleball matches with AI-powered matchmaking. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Player Management**: Add, edit, and manage player profiles with skill scores
- **AI Match Generator**: Advanced algorithm considering fatigue, gender balance, and session planning
- **Match Recording**: Record match results with automatic score recalculation
- **Statistics**: Track player performance and match history
- **Mobile-First Design**: Optimized for mobile devices with responsive layout

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

### Players Table
```sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  score DECIMAL(3,1) DEFAULT 5.0 CHECK (score >= 0.0 AND score <= 10.0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

## 📁 Supabase Storage Setup

### 1. Create Storage Bucket
In your Supabase dashboard, go to Storage and create a new bucket:
- **Bucket name**: `images`
- **Public bucket**: ✅ (checked)
- **File size limit**: 5MB
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
