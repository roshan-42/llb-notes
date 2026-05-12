# LLBNOTES - Architecture & Component Guide

## Project Overview

**LLBNOTES** is a comprehensive educational platform for LLB (Bachelor of Law) notes in Nepal. It follows a three-year annual program structure and provides:

- Bilingual (English/Nepali) study materials
- Chapter-wise organization
- Past exam questions with answers
- Admin dashboard for content management
- Clean, dark-mode UI with muted gold accents

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS (dark mode) |
| **Backend** | Next.js Server Actions, API Routes |
| **Database** | PostgreSQL with Prisma ORM |
| **Icons** | Lucide React |
| **State Management** | React `useState` (client-side) |

---

## Directory Structure

```
LLBNOTES/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (dark mode)
│   │   ├── page.tsx                  # Home: Year selection
│   │   ├── globals.css               # Global dark mode styles
│   │   ├── api/
│   │   │   ├── subjects/[slug]/chapters/route.ts    # Fetch chapters
│   │   │   ├── chapters/[id]/questions/route.ts     # Fetch questions
│   │   │   └── admin/
│   │   │       ├── notes/route.ts                   # Admin notes CRUD
│   │   │       └── questions/route.ts               # Admin questions CRUD
│   │   ├── year/[year]/
│   │   │   └── page.tsx              # Year page: subject grid
│   │   ├── year/[year]/subject/[slug]/
│   │   │   ├── page.tsx              # Subject hub: Notes/Exams options
│   │   │   ├── notes/page.tsx        # Notes viewer (sidebar + content)
│   │   │   └── exams/page.tsx        # Exam questions by chapter
│   │   └── admin/
│   │       ├── page.tsx              # Admin dashboard
│   │       ├── subjects/page.tsx     # Manage subjects/chapters
│   │       ├── notes/page.tsx        # Manage notes with editor
│   │       ├── questions/page.tsx    # Manage exam questions
│   │       └── settings/page.tsx     # Settings (TODO)
│   ├── components/
│   │   ├── DualLanguageToggle.tsx    # EN/NP language selector
│   │   ├── ExamQuestionCard.tsx      # Question card with show/hide answer
│   │   └── AdminNoteEditor.tsx       # Side-by-side EN/NP editor (modal)
│   └── lib/
│       ├── prisma.ts                 # Prisma client singleton
│       └── actions.ts                # Next.js Server Actions (CRUD)
├── prisma/
│   ├── schema.prisma                 # Database models
│   └── seed.ts                       # Sample data seeder
├── public/                           # Static assets
├── tailwind.config.ts                # Tailwind configuration
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── postcss.config.js                 # PostCSS for Tailwind
├── package.json                      # Dependencies
├── SETUP.md                          # Setup instructions
└── ARCHITECTURE.md                   # This file
```

---

## Data Models

### Prisma Schema (5 Core Models)

```prisma
Year
├── id: Int (PK)
├── year: Int (1, 2, 3) ← Three-year annual program
└── subjects: Subject[]

Subject
├── id: Int (PK)
├── yearId: Int (FK)
├── name_en, name_np: String
├── slug: String (unique)
├── icon: String (Lucide icon name)
└── chapters: Chapter[]

Chapter
├── id: Int (PK)
├── subjectId: Int (FK)
├── title_en, title_np: String
├── order: Int (1, 2, 3, ...)
├── notes: Note[]
└── questions: Question[]

Note
├── id: Int (PK)
├── chapterId: Int (FK)
├── title_en, title_np: String
├── content_en, content_np: String (text)
├── order: Int

Question
├── id: Int (PK)
├── chapterId: Int (FK)
├── question_en, question_np: String (text)
├── answer_en, answer_np: String (text)
└── type: "past" | "possible"

User (TODO: Auth Integration)
├── id: Int (PK)
├── email: String (unique)
├── name: String
├── password: String (hash)
└── role: "user" | "admin"
```

---

## Key Components

### 1. **DualLanguageToggle.tsx**

Reusable language switcher component.

```typescript
// Usage
<DualLanguageToggle
  currentLanguage="en"
  onLanguageChange={(lang) => setLanguage(lang)}
/>
```

**Features:**
- Buttons for English and Nepali
- Amber accent when active
- Icon (Globe from lucide-react)
- Callback pattern for parent state management

---

### 2. **ExamQuestionCard.tsx**

Displays a single exam question with collapsible answer.

```typescript
// Usage
<ExamQuestionCard
  question_en="Define Constitutional Law"
  question_np="संवैधानिक कानून परिभाषित गर्नुहोस्"
  answer_en="..."
  answer_np="..."
  type="past"
  language="en"
/>
```

**Features:**
- Question text (EN or NP based on language prop)
- Type badge ("Past Question" or "Possible Question")
- Show/Hide answer toggle with chevron icon
- Answer hidden by default (useState)
- Amber accent for past questions

---

### 3. **AdminNoteEditor.tsx**

Modal-based bilingual note editor with side-by-side inputs.

```typescript
// Usage
<AdminNoteEditor
  initialData={{ title_en: "...", title_np: "..." }}
  onSave={async (data) => {
    await updateNote(noteId, data);
  }}
  onCancel={() => setEditing(false)}
/>
```

**Features:**
- Fixed modal overlay (z-50, blur backdrop)
- Two-column layout (EN left, NP right)
- Validation: ensures both languages filled
- Loading state during save
- Error display with icon
- Close button (X) and Cancel/Save footer

---

## Page Hierarchies & Navigation Flows

### Public Navigation

```
HOME (/)
├── Hero section
├── Year selection cards (1, 2, 3)
└── Features overview

YEAR PAGE (/year/[year])
├── Header: "Year 1 - Foundation & Legal Theory"
├── Subject grid (cards with icon, EN name, NP name)
└── Link to Subject Hub

SUBJECT HUB (/year/[year]/subject/[slug])
├── Header: Subject name + Nepali
├── Two large cards:
│   ├── "Study Notes" (blue accent)
│   └── "Exam Questions" (purple accent)
└── Chapter list preview

NOTES VIEWER (/year/[year]/subject/[slug]/notes)
├── Sticky header with title + DualLanguageToggle
├── Left sidebar:
│   ├── Chapter list (expandable)
│   └── Note titles
├── Main content area:
│   └── Note content (EN or NP)
└── Collapsible chapter navigation

EXAMS PAGE (/year/[year]/subject/[slug]/exams)
├── Header: subject name + DualLanguageToggle
├── Chapter selector buttons (grid)
├── Filter tabs: All | Past | Possible
├── Question cards (vertical stack)
│   └── Each card has show/hide answer toggle
└── Language-aware content
```

### Admin Navigation

```
ADMIN DASHBOARD (/admin)
├── Stats cards (4): Subjects, Chapters, Notes, Questions
└── Action cards:
    ├── "Manage Subjects" → /admin/subjects
    ├── "Manage Notes" → /admin/notes (with AdminNoteEditor modal)
    ├── "Manage Questions" → /admin/questions
    └── "Settings" → /admin/settings (TODO)

ADMIN SUBJECTS (/admin/subjects)
├── Grouped by Year
├── Subject cards with chapter count
└── Edit/Delete buttons per subject

ADMIN NOTES (/admin/notes)
├── Search bar
├── Notes list with subject/chapter info
├── Edit button → opens AdminNoteEditor modal
└── Delete buttons

ADMIN QUESTIONS (/admin/questions)
├── Search + filter (All/Past/Possible)
├── Questions list with type badge
├── Collapsible answer detail
├── Edit/Delete buttons
└── Subject/chapter context
```

---

## Server Actions & API Routes

### Next.js Server Actions (`src/lib/actions.ts`)

**CRUD Operations** (use `'use server'` directive):

```typescript
// Notes
createNote(data)       → Creates new note in chapter
updateNote(id, data)   → Updates EN/NP content
deleteNote(id)         → Deletes note

// Questions
createQuestion(data)   → Creates exam question
updateQuestion(id, data) → Updates question/answer
deleteQuestion(id)     → Deletes question

// Subjects
createSubject(data)    → Creates new subject
updateSubject(id, data) → Updates subject info

// Chapters
createChapter(data)    → Creates chapter in subject
updateChapter(id, data) → Updates chapter title
```

All actions:
- Use `prisma` client to query/mutate DB
- Call `revalidatePath()` to refresh cache
- Return `{ success, ...result }` or `{ success, error }`

### API Routes (`src/app/api/...`)

**Public (Read-Only):**
- `GET /api/subjects/[slug]/chapters` → Chapters with notes
- `GET /api/chapters/[id]/questions` → Questions for a chapter

**Admin:**
- `GET /api/admin/notes` → All notes (for management page)
- `GET /api/admin/questions` → All questions (for management page)

---

## State Management Strategy

### Client-Side (React `useState`)

**Per-Component State:**
- **DualLanguageToggle**: `language` ('en' | 'np')
- **ExamQuestionCard**: `showAnswer` (boolean)
- **AdminNoteEditor**: `data` (form fields), `isSaving`, `error`

**Per-Page State:**
- **Notes Viewer**: `selectedChapter`, `expandedChapters`, `language`
- **Exams Page**: `selectedChapterId`, `filterType`, `language`
- **Admin Notes**: `selectedNote`, `isEditing`, `notes` (list)

### Server-Side (Next.js Server Actions)

- Mutations go through Server Actions
- No Redux/Context needed; forms are simple
- `revalidatePath()` handles cache invalidation
- Can upgrade to `useTransition()` for pending states

### Upgrade Path

If needed later:
- Wrap components with React 19 `useActionState()` for optimistic updates
- Use `useTransition()` to track mutation loading states
- No Redux needed for current scope

---

## Styling & Theme

### Dark Mode (Always On)

- **Background**: `bg-slate-950` (body), gradients to `slate-900`
- **Cards**: `bg-slate-800` with `border-slate-700`
- **Hover**: `hover:border-amber-600/50`, `hover:shadow-amber-600/10`
- **Text**: `text-white` (headings), `text-gray-300`/`text-gray-400` (body)
- **Accent**: `text-amber-600`, `bg-amber-600/10`, `border-amber-600/30`

### Component Patterns

**Card:**
```jsx
<div className="border border-slate-700 bg-slate-800 rounded-lg p-6 hover:border-amber-600/50 transition-all hover:shadow-xl hover:shadow-amber-600/10">
  ...
</div>
```

**Button:**
```jsx
// Primary (Amber)
<button className="bg-amber-600 hover:bg-amber-500 text-white transition-colors">

// Secondary (Slate)
<button className="border border-slate-600 text-gray-300 hover:bg-slate-800">

// Danger (Red)
<button className="border border-red-900/50 text-red-400 hover:bg-red-900/10">
```

**Nepali Text:**
- Increase font size (`text-lg`) for readability
- Add `leading-relaxed` for better spacing

---

## Bilingual Content Handling

### Data Model
- Every content field has `_en` and `_np` variants
- Example: `Note.content_en`, `Note.content_np`

### UI Pattern
- Store `language: 'en' | 'np'` in component state
- Render conditionally: `{language === 'en' ? content_en : content_np}`
- Pass to API/server actions as separate fields

### Nepali Display
```jsx
<div className={`text-gray-300 ${language === 'np' ? 'text-lg leading-relaxed' : ''}`}>
  {language === 'en' ? content_en : content_np}
</div>
```

---

## Performance Optimizations

### Current
- Static generation for `/year/[year]` pages (`generateStaticParams()`)
- API routes for dynamic content (chapters, questions)
- Lazy loading of admin pages

### Potential Upgrades
- Image optimization for icons/assets
- Incremental Static Regeneration (ISR) for content updates
- Caching headers on API routes
- Database indexes on `slug`, `year`, `chapterId`

---

## Security Considerations

### Current (MVP)
- No authentication (public read access)
- No authorization (admin routes unprotected)

### TODO
- Add middleware to protect `/admin` routes
- Implement authentication (Clerk, Auth0, or NextAuth)
- Add role-based access control (user vs. admin)
- Validate inputs on server actions
- Rate limiting on API routes
- CSRF protection

---

## Error Handling

### Server Actions
```typescript
try {
  const note = await prisma.note.create({ data });
  revalidatePath('/admin/notes');
  return { success: true, note };
} catch (error) {
  return { success: false, error: 'Failed to create note' };
}
```

### Components
```typescript
const [error, setError] = useState<string | null>(null);

const handleSave = async () => {
  try {
    await onSave(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error');
  }
};
```

---

## Testing Strategy (TODO)

- **Unit**: Component rendering with different props
- **Integration**: Page navigation, form submission
- **E2E**: Complete flows (select year → subject → notes)

Suggested tools:
- Jest + React Testing Library (components)
- Playwright (E2E)
- Prisma test utilities (DB)

---

## Deployment Checklist

- [ ] Database: PostgreSQL (Vercel Postgres, Supabase, or self-hosted)
- [ ] Environment variables: `.env.local` → `.env.production`
- [ ] Authentication: Choose & implement
- [ ] Admin access: Protect `/admin` routes with middleware
- [ ] Seed data: Run `npm run db:seed`
- [ ] Build: `npm run build` (check for errors)
- [ ] Deploy: Vercel, Netlify, or self-hosted server

---

## Future Enhancements

1. **User Progress Tracking**: Mark chapters/notes as read
2. **Search Functionality**: Full-text search across notes/questions
3. **Favorites/Bookmarks**: Save important notes
4. **Study Timer**: Pomodoro-style study sessions
5. **Flashcards**: Extract Q&A pairs for spaced repetition
6. **Admin Comments**: Collaborative editing notes in Nepali
7. **Mobile App**: React Native or Flutter version
8. **API Documentation**: OpenAPI/Swagger for external tools

---

## Quick Reference

| Task | File | Action |
|------|------|--------|
| Add Subject | `/admin/subjects` | Click "New Subject" |
| Add Chapter | `/admin/subjects` | Subject card → add chapter |
| Add Note | `/admin/notes` | Click "New Note" |
| Edit Note | `/admin/notes` | Click "Edit" → AdminNoteEditor |
| Add Question | `/admin/questions` | Click "New Question" |
| Seed Data | Terminal | `npm run db:seed` |
| View Notes | `/year/1/subject/[slug]/notes` | Browse chapters |
| Practice Exams | `/year/1/subject/[slug]/exams` | Select chapter, toggle answers |
| Change Language | Any page | Toggle button (EN/NP) |

---

## Support

For setup help, see `SETUP.md`.
For database changes, see `prisma/schema.prisma`.
For design decisions, see this file.

Happy coding! 🚀
