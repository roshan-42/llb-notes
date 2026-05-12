# LLBNOTES - Setup & Architecture Guide

## Quick Start

### Prerequisites
- Node.js 18+ (ideally 20+)
- PostgreSQL 14+ running locally or remote access
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Copy env template
cp .env.example .env.local

# Update .env.local with your PostgreSQL connection
# DATABASE_URL="postgresql://user:password@localhost:5432/llbnotes"

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed sample data
npm run db:seed
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Project Structure

```
LLBNOTES/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   ├── api/               # API routes
│   │   │   └── subjects/[slug]/chapters/route.ts
│   │   │   └── chapters/[id]/questions/route.ts
│   │   ├── year/[year]/
│   │   │   └── page.tsx       # Year selection
│   │   │   └── subject/[slug]/
│   │   │       ├── page.tsx   # Subject hub
│   │   │       ├── notes/page.tsx
│   │   │       └── exams/page.tsx
│   │   └── admin/
│   │       ├── page.tsx       # Admin dashboard
│   │       ├── subjects/
│   │       ├── notes/
│   │       ├── questions/
│   │       └── settings/
│   ├── components/
│   │   ├── DualLanguageToggle.tsx
│   │   ├── ExamQuestionCard.tsx
│   │   └── AdminNoteEditor.tsx
│   └── lib/
│       ├── prisma.ts         # Prisma client singleton
│       └── actions.ts        # Server actions for CRUD
├── public/                   # Static assets
├── tailwind.config.ts       # Tailwind CSS config
├── next.config.ts           # Next.js config
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Database Schema

### Models

**Year**
- id: Int (PK)
- year: Int (1, 2, 3)
- subjects: Subject[] (relation)

**Subject**
- id: Int (PK)
- yearId: Int (FK)
- name_en: String
- name_np: String
- slug: String (unique)
- icon: String (optional)
- chapters: Chapter[] (relation)

**Chapter**
- id: Int (PK)
- subjectId: Int (FK)
- title_en: String
- title_np: String
- order: Int
- notes: Note[] (relation)
- questions: Question[] (relation)

**Note**
- id: Int (PK)
- chapterId: Int (FK)
- title_en: String
- title_np: String
- content_en: String (text)
- content_np: String (text)
- order: Int

**Question**
- id: Int (PK)
- chapterId: Int (FK)
- question_en: String
- question_np: String
- answer_en: String
- answer_np: String
- type: String ("past" | "possible")

**User**
- id: Int (PK)
- email: String (unique)
- name: String (optional)
- password: String (hashed)
- role: String ("user" | "admin")

---

## Key Features

### 1. Hierarchical Navigation
- **Home** → Year Selection (1st, 2nd, 3rd)
- **Year** → Subject Grid
- **Subject** → Hub with Notes or Exams
- **Notes** → Chapter Sidebar + Content Viewer
- **Exams** → Chapter Selection + Question Cards

### 2. Bilingual Support
- **DualLanguageToggle** component toggles between English (EN) and Nepali (NP)
- All content fields have `_en` and `_np` variants
- Language preference persists in component state (upgrade to localStorage if needed)

### 3. Notes Viewer
- Persistent left sidebar showing chapter hierarchy
- Main content area displays notes for selected chapter
- Language toggle in sticky header
- Responsive layout with collapsible chapter menu

### 4. Exam Portal
- Chapter selection tabs
- Filter buttons (All, Past Questions, Possible Questions)
- **ExamQuestionCard** with show/hide answer toggle
- Bilingual question-answer display

### 5. Admin Dashboard
- Overview statistics (subjects, chapters, notes, questions)
- CRUD management sections:
  - **Manage Subjects**: Add/edit/delete subjects and chapters
  - **Manage Notes**: Edit bilingual notes side-by-side
  - **Manage Questions**: Add/edit exam questions
  - **Settings**: User management (to implement)

### 6. Admin Note Editor
- **AdminNoteEditor** component (modal-based)
- Side-by-side English (left) and Nepali (right) input fields
- Real-time validation
- Error handling
- Save/Cancel actions with loading state

---

## Server Actions (Next.js)

Located in `src/lib/actions.ts`:

```typescript
// Notes
createNote()
updateNote()
deleteNote()

// Questions
createQuestion()
updateQuestion()
deleteQuestion()

// Subjects
createSubject()
updateSubject()

// Chapters
createChapter()
updateChapter()
```

All actions use Prisma and call `revalidatePath()` to sync cache.

---

## API Routes

### Fetch Chapters
```
GET /api/subjects/[slug]/chapters
Response: Chapter[] with nested notes
```

### Fetch Questions
```
GET /api/chapters/[id]/questions
Response: Question[]
```

---

## Styling & Design Language

### Color Palette
- **Background**: Deep charcoal/black (`#03071e` → `#1e293b`)
- **Accent**: Muted gold/amber (`#d97706` → `#fbbf24`)
- **Cards**: Slate with hover borders
- **Text**: White, gray-300, gray-400

### Components
- Border: `border-slate-700`
- Hover: `hover:border-amber-600/50`
- Accents: `text-amber-600`, `bg-amber-600/10`
- Transitions: Smooth color/shadow transitions

### Typography
- Headings: Bold white
- Body: Gray-300 to gray-400
- Nepali text: Slightly larger (text-lg) for readability

---

## Development Workflow

### Add a New Subject
```typescript
// Use server action
const result = await createSubject({
  yearId: 1,
  name_en: "Constitutional Law",
  name_np: "संवैधानिक कानून",
  slug: "constitutional-law",
  icon: "📜"
});
```

### Add a Chapter to a Subject
```typescript
const result = await createChapter({
  subjectId: 1,
  title_en: "Introduction",
  title_np: "परिचय",
  order: 1
});
```

### Add a Note
```typescript
const result = await createNote({
  chapterId: 1,
  title_en: "Basics of Constitutional Law",
  title_np: "संवैधानिक कानूनको आधार",
  content_en: "...",
  content_np: "...",
  order: 1
});
```

### Add Exam Questions
```typescript
const result = await createQuestion({
  chapterId: 1,
  question_en: "Define constitutional law",
  question_np: "संवैधानिक कानून परिभाषित गर्नुहोस्",
  answer_en: "...",
  answer_np: "...",
  type: "past" // or "possible"
});
```

---

## Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/llbnotes"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## Authentication (To Implement)

Add authentication middleware for `/admin` routes:
- JWT or session-based auth
- Protect with middleware in Next.js 15
- Role-based access control (user vs admin)

Suggested: Clerk, Auth0, or NextAuth.js

---

## Deployment

### Vercel (Recommended)
```bash
# Connect repo and deploy
# Vercel auto-configures env variables
```

### Self-Hosted
1. Build: `npm run build`
2. Run: `npm start`
3. Ensure PostgreSQL is accessible
4. Set production env vars

---

## Next Steps

1. Implement authentication middleware
2. Add admin page for subjects/chapters CRUD
3. Add admin notes/questions editor pages
4. Seed database with sample data
5. Add search functionality
6. Implement study progress tracking
7. Add dark/light mode toggle (if desired)
8. Deploy to production
