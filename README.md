# Habit Tracker

A comprehensive, modern habit tracking web application built with Next.js, TypeScript, Tailwind CSS, and Preline UI. Track your daily habits, visualize your progress, and build positive routines with beautiful charts, streaks, and goal setting.

## ✨ Features

### Core Functionality
- **User Authentication** - Secure signup/login with NextAuth.js
- **Habit Management** - Create, edit, delete, and organize habits
- **Daily/Weekly/Monthly Tracking** - Flexible tracking frequencies
- **Progress Visualization** - Beautiful charts, heatmaps, and streak tracking
- **Notes & Journaling** - Add notes and reflections to each habit entry
- **Goal Setting** - Set and track specific goals for your habits
- **Categories & Tags** - Organize habits with custom categories
- **Customizable Habits** - Choose colors, icons, targets, and units

### Visualization & Analytics
- **Streak Tracking** - See your current and best streaks
- **Completion Rate Charts** - Track your progress over time
- **Calendar Heatmaps** - GitHub-style year overview
- **Analytics Dashboard** - Comprehensive insights into your habits
- **Progress Charts** - Line charts and bar charts for trend analysis

### Technical Features
- **Mobile-First Design** - Fully responsive and optimized for mobile devices
- **Modern UI with Preline** - Clean, intuitive interface with Preline UI components and smooth animations
- **Dark Mode Support** - Automatic dark/light theme switching
- **TypeScript** - Full type safety throughout the application
- **Database Integration** - SQLite with Prisma ORM (zero setup required)
- **Docker Support** - Easy deployment with Docker and docker-compose
- **Real-time Updates** - Instant feedback on habit completion

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- No database setup required (uses SQLite)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habit-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   *Note: If you encounter dependency resolution issues, use:*
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your authentication secrets (SQLite database is created automatically):
   ```
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secure-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push  # Creates SQLite database and applies schema
   npm install tsx  # Required for seeding
   npm run db:seed  # Optional: Add default categories
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Production Deployment (Recommended)

1. **Start the application**
   ```bash
   docker-compose up -d
   ```

2. **Apply database schema** (SQLite database is created automatically)
   ```bash
   docker-compose exec app npx prisma db push
   ```

The application will be available at [http://localhost:3000](http://localhost:3000) with SQLite database stored in a Docker volume.

### Development with Docker

For development with hot-reload and volume mounts:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Using Docker Only

1. **Build the optimized production image**
   ```bash
   docker build -t habit-tracker .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="file:./data/production.db" \
     -e NEXTAUTH_URL="http://localhost:3000" \
     -e NEXTAUTH_SECRET="your-secret" \
     -v habit_data:/app/data \
     habit-tracker
   ```

### Docker Features

- **Multi-stage build** - Optimized production image with minimal size
- **Non-root user** - Security best practices with dedicated nextjs user
- **SQLite database** - No external database dependencies
- **Data persistence** - SQLite database stored in Docker volumes
- **Alpine Linux** - Smaller, more secure base images

## 📱 Usage

### Creating Your First Habit

1. **Sign up** for a new account or **sign in** to an existing one
2. Navigate to the **Dashboard**
3. Click **"Add Habit"** to create your first habit
4. Fill in the habit details:
   - Name (e.g., "Drink 8 glasses of water")
   - Description (optional)
   - Color and icon
   - Frequency (daily, weekly, monthly)
   - Target and unit
   - Category (optional)

### Tracking Progress

1. **Mark habits complete** by clicking the circle icon on the dashboard
2. **Add notes** by clicking the edit icon to journal about your experience
3. **View your streaks** and completion rates
4. **Check analytics** to see long-term trends

### Setting Goals

1. Navigate to the **Goals** section
2. Click **"Add Goal"** 
3. Choose a habit and set a target (e.g., "Exercise for 30 days straight")
4. Track your progress toward the goal

### Organizing with Categories

1. Go to the **Categories** section
2. Create custom categories (e.g., "Health", "Learning", "Productivity")
3. Assign categories to habits for better organization

## 🛠 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework  
- **Preline UI 3.2** - Modern component library with dark mode support (JavaScript-based components)
- **Lucide React** - Beautiful icons
- **Recharts** - Chart visualization library
- **React Calendar Heatmap** - GitHub-style heatmaps

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **NextAuth.js** - Authentication solution
- **Prisma** - Modern database ORM
- **SQLite** - Lightweight, serverless database
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### Development & Deployment
- **Docker** - Containerization
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking

## 📊 Database Schema

The application uses SQLite with a well-structured schema managed by Prisma with the following main entities:

- **Users** - User accounts and profiles
- **Habits** - Habit definitions and settings
- **HabitEntries** - Daily habit completion records
- **Categories** - Habit organization categories
- **Goals** - User-defined habit goals
- **Tags** - Flexible tagging system

### SQLite Database Benefits

- **Zero Configuration** - No database server setup required
- **File-based** - Easy to backup, copy, and migrate
- **Serverless** - Embedded database with excellent performance
- **Cross-platform** - Works on all operating systems
- **ACID Compliance** - Full transaction support
- **Small Footprint** - Perfect for containerized deployments

### Schema Management with SQLite

This project uses **`prisma db push`** instead of migrations for SQLite:

- **`db push`** - Directly applies schema changes to the database (recommended for SQLite)
- **Migrations** - Not used as they're better suited for production databases like PostgreSQL
- **Schema changes** - Simply run `npx prisma db push` after modifying `schema.prisma`
- **No migration files** - SQLite schema is managed directly through the Prisma schema file

### Database Backup & Migration

**Backup your SQLite database:**
```bash
# Development
cp dev.db backup-$(date +%Y%m%d).db

# Production (Docker)
docker-compose exec app cp /app/data/production.db /app/data/backup-$(date +%Y%m%d).db
docker cp container_name:/app/data/backup-$(date +%Y%m%d).db ./backups/
```

**Migrate between environments:**
```bash
# Copy development database to production
cp dev.db data/production.db

# Or restore from backup
cp backup-20231201.db dev.db
```

## 🎨 Design Philosophy

### Mobile-First Approach
- Responsive design that works perfectly on all devices
- Touch-friendly interfaces
- Optimized for small screens

### User Experience
- Intuitive navigation and clear visual hierarchy powered by Preline UI
- Minimal clicks to complete common tasks
- Immediate visual feedback for actions
- Accessible and inclusive design with full dark mode support
- Consistent design system across all components

### Data Visualization
- Clean, readable charts and graphs
- Color-coded progress indicators
- Visual streaks and achievements
- Historical data presentation

## 🔐 Security Features

- **Secure Authentication** - Encrypted passwords with bcrypt
- **Session Management** - Secure JWT tokens
- **Data Validation** - Comprehensive input validation with Zod
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **Environment Variables** - Sensitive data stored securely

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Habits
- `GET /api/habits` - Fetch user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit

### Habit Entries
- `GET /api/habits/[id]/entries` - Fetch habit entries
- `POST /api/habits/[id]/entries` - Create/update habit entry

### Goals
- `GET /api/goals` - Fetch user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/[id]` - Update goal

### Categories
- `GET /api/categories` - Fetch categories
- `POST /api/categories` - Create new category

## 🧪 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Apply schema changes to SQLite database
- `npm run db:studio` - Open Prisma Studio

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── habits/            # Habit-related components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   ├── auth.ts            # Authentication configuration
│   ├── prisma.ts          # Database client
│   └── utils.ts           # Helper functions
└── prisma/                # Database schema and migrations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Preline UI](https://preline.co/) - Modern UI components with dark mode
- [Prisma](https://prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Recharts](https://recharts.org/) - Composable charting library

---

Built with ❤️ using modern web technologies. Start building better habits today! 🌟