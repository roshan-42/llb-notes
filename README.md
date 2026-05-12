# LLBNOTES - LLB Educational Platform for Nepal

A comprehensive, production-ready educational platform for studying Law (LLB) in Nepal. Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**.

## Features

✨ **Bilingual Support** — English & Nepali content side-by-side
📚 **Chapter-Wise Organization** — Hierarchical navigation (Year → Subject → Chapter → Content)
✏️ **Dual-Language Editor** — Admin interface for entering EN/NP content simultaneously
📝 **Study Notes** — Comprehensive notes with persistent chapter sidebar
🧪 **Exam Questions** — Past papers & possible questions with collapsible answers
🎨 **Dark Mode Design** — Deep charcoal/black backgrounds with muted gold accents
🔐 **Admin Dashboard** — Full CRUD for subjects, chapters, notes, and questions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| UI Components | Tailwind CSS (dark mode), Lucide React icons |
| Backend | Next.js Server Actions, API Routes |
| Database | PostgreSQL + Prisma ORM |
| State | React `useState` (no Redux needed) |

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
```bash
cp .env.example .env.local
# Edit .env.local with your PostgreSQL connection
npx prisma migrate dev --name init
```

### 3. Seed Sample Data (Optional)
```bash
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
LLBNOTES/
├── prisma/schema.prisma           # 5 core data models
├── src/
│   ├── app/
│   │   ├── page.tsx               # Home (year selection)
│   │   ├── year/[year]/           # Year → subjects
│   │   ├── year/[year]/subject/   # Subject hub (notes/exams)
│   │   │   ├── notes/             # Notes viewer with sidebar
│   │   │   └── exams/             # Exam questions by chapter
│   │   ├── admin/                 # Admin dashboard & management
│   │   ├── api/                   # API routes for data fetching
│   │   └── globals.css            # Dark mode styles
│   ├── components/
│   │   ├── DualLanguageToggle.tsx # EN/NP language switcher
│   │   ├── ExamQuestionCard.tsx   # Question card with show/hide
│   │   └── AdminNoteEditor.tsx    # Side-by-side EN/NP editor
│   └── lib/
│       ├── prisma.ts              # Prisma client singleton
│       └── actions.ts             # Server actions (CRUD)
├── SETUP.md                       # Step-by-step setup guide
└── ARCHITECTURE.md                # Detailed design & navigation
```

## Core Components

### DualLanguageToggle
Language switcher button (EN/NP) with amber accent. Used on all content pages.

```tsx
<DualLanguageToggle 
  currentLanguage={language}
  onLanguageChange={setLanguage}
/>
```

### ExamQuestionCard
Single exam question with collapsible answer and type badge (past/possible).

```tsx
<ExamQuestionCard 
  question_en="..." question_np="..."
  answer_en="..." answer_np="..."
  type="past"
  language="en"
/>
```

### AdminNoteEditor
Modal-based bilingual note editor with validation and loading state.

```tsx
<AdminNoteEditor 
  initialData={{ title_en, title_np, content_en, content_np }}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

## Data Model

**5 Core Entities:**

- **Year** (1, 2, 3) — annual program structure
- **Subject** — courses per year with bilingual names
- **Chapter** — sections within subjects
- **Note** — study materials with EN/NP content
- **Question** — exam questions (past/possible) with answers

Each Note and Question has `_en` and `_np` fields for bilingual content.

## Navigation Hierarchy

```
Home
├── Year Selection (1st, 2nd, 3rd)
│   └── Subject Grid
│       └── Subject Hub
│           ├── Study Notes
│           │   └── Chapter Sidebar + Content Viewer
│           └── Exam Questions
│               └── Chapter Selector + Question Cards
└── Admin Dashboard
    ├── Manage Subjects
    ├── Manage Notes (with editor)
    ├── Manage Questions
    └── Settings
```

## Server Actions (CRUD)

All mutations via **Next.js Server Actions** in `src/lib/actions.ts`:

```typescript
createNote()     updateNote()     deleteNote()
createQuestion() updateQuestion() deleteQuestion()
createSubject()  updateSubject()
createChapter()  updateChapter()
```

## Admin Workflow

1. **Go to** `/admin/subjects` → Create subjects & chapters
2. **Go to** `/admin/notes` → Click "Edit" on a note → **AdminNoteEditor** opens
   - Left column: English (title + content)
   - Right column: Nepali (शीर्षक + विषयवस्तु)
   - Save validates both languages filled
3. **Go to** `/admin/questions` → Create/edit exam questions with answers in both languages

## Styling

### Dark Mode (Default)
- **Bg**: `slate-950` (body), `slate-900` (sections)
- **Cards**: `slate-800` border `slate-700`
- **Accent**: Muted gold/amber (`amber-600`)
- **Hover**: `border-amber-600/50`, shadow glow

### Nepali Text
- Slightly larger font (`text-lg`) for readability
- Better line spacing (`leading-relaxed`)

## Authentication (TODO)

Admin routes (`/admin/*`) are currently unprotected. To secure:

1. Choose auth provider (Clerk, Auth0, NextAuth.js)
2. Add middleware in `src/middleware.ts`
3. Protect `/admin/*` with role check
4. Add User model to Prisma schema

## API Routes

### Public (Read-Only)
```
GET /api/subjects/[slug]/chapters
GET /api/chapters/[id]/questions
```

### Admin
```
GET /api/admin/notes
GET /api/admin/questions
```

## Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/llbnotes"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Scripts

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm start             # Run production server
npm run lint          # Run ESLint
npm run db:push      # Push schema to DB
npm run db:seed      # Populate sample data
npm run db:studio    # Prisma Studio UI
npm run db:generate  # Generate Prisma client
```

## Key Files to Understand

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models & relationships |
| `src/lib/actions.ts` | Server actions for CRUD ops |
| `src/components/DualLanguageToggle.tsx` | Reusable language switcher |
| `src/components/ExamQuestionCard.tsx` | Question display + toggle |
| `src/components/AdminNoteEditor.tsx` | Bilingual note editor modal |
| `src/app/admin/notes/page.tsx` | Admin notes management UI |
| `SETUP.md` | Step-by-step setup instructions |
| `ARCHITECTURE.md` | Detailed design & navigation flows |

## Performance

- **Static Generation**: Year pages pre-built at build time
- **API Routes**: Cached chapter/question fetching
- **Client Components**: Language toggle, show/hide answer
- **Images**: Lucide icons (SVG, zero overhead)

## Future Enhancements

- 🔐 Authentication & authorization
- 🔍 Full-text search (notes & questions)
- 📊 User progress tracking
- ⭐ Bookmarks & favorites
- 🧠 Flashcard system
- ⏱️ Study timer (Pomodoro)
- 📱 Mobile app (React Native)

## License

MIT

## Support

For setup help, see **SETUP.md**.
For architecture details, see **ARCHITECTURE.md**.

---

**Built with ❤️ for LLB students in Nepal**
