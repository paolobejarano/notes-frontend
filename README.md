# Notes Frontend

Next.js frontend for the Notes application with auto-save and category management.

## Setup
```bash
npm install
npm run dev
```

## Development Scripts
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Environment Variables
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_ROUTE=/api
```

## Pages
- **`/`** - Home with notes grid and category filtering
- **`/login`** - Sign in with floating labels
- **`/register`** - User registration  
- **`/new-note`** - Create new note with auto-save
- **`/note/[id]`** - Edit existing note

## Key Features

### Auto-Save
- 1.5 second debounced saving
- "Last edit" timestamp display
- Seamless create → edit flow

### UI Components
- Custom category dropdown with color indicators
- Floating label inputs with show/hide password
- Pill-style buttons with hover effects
- Category-colored note cards (50% opacity backgrounds)

### Layout
- 3-column note grid (9 notes per page)
- Left sidebar with category filtering and note counts
- Borderless, clean design
- Click-to-edit note cards

### Authentication
- Persistent sessions (7 days)
- localStorage token management
- Automatic logout on token expiration

## Design System

### Colors
- **Background**: `#FAF1E3` (cream)
- **Primary**: `#957139` (brown)
- **Categories**: Dynamic colors per category

### Typography
- **Headings**: Inria Serif (elegant serif)
- **Body**: Inter (readable sans-serif)
- **Floating labels**: Custom animations

### Interactive Elements
- Pill buttons with 20% opacity hover
- Category filtering with bold selection
- Hover shadow effects on note cards

## Code Quality

### Linting & Building
```bash
# Check linting (15 issues - mostly TypeScript any types)
npm run lint

# Type checking (passes)
npx tsc --noEmit

# Production build (successful)
npm run build
```

### Known Linting Issues
- TypeScript `any` types in error handlers (non-critical)
- React Hooks dependencies (intentionally excluded for performance)
- Quote escaping in JSX text (cosmetic)
- Custom fonts warning (App Router compatibility)

## Tech Stack
- Next.js 16 with App Router
- React 19, TypeScript
- Tailwind CSS with custom styles
- Axios for API communication
- Custom components for reusability
