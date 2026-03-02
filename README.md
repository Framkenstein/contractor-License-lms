# B-2 Contractor License Exam Prep LMS

A professional Learning Management System for California B-2 Residential Remodeling Contractor License exam preparation.

## Features

- **Video Lessons**: 9 modules with 54+ video lessons
- **Interactive Quizzes**: Section quizzes with instant feedback
- **Practice Exams**: 12 full practice exams (Law & Business + Trade)
- **Progress Tracking**: localStorage-based progress persistence
- **Modern UI**: Slate and Amber industrial color palette with Framer Motion animations

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons

## Setup

### 1. Install Dependencies

```bash
cd lms
npm install
```

### 2. Link Video Files

**Option A: Symbolic Link (Recommended)**

Run PowerShell as Administrator:
```powershell
.\setup-videos.ps1
```

**Option B: Copy Videos**

Copy your video files to `public/videos/`

### 3. Generate Course Manifest (Optional)

If you add new videos, regenerate the manifest:
```bash
npm run generate-manifest
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
lms/
├── public/
│   └── videos/          # Video files (symlinked or copied)
├── scripts/
│   └── generate-manifest.js  # Auto-generate lessons.json
├── src/
│   ├── app/
│   │   ├── globals.css  # Global styles
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Main dashboard
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── QuizEngine.tsx
│   │   ├── Sidebar.tsx
│   │   └── VideoPlayer.tsx
│   ├── data/
│   │   ├── lessons.json # Course structure
│   │   └── quizzes.json # Quiz questions
│   ├── hooks/
│   │   └── useProgress.ts
│   ├── lib/
│   │   └── courseData.ts
│   └── types/
│       └── index.ts
└── package.json
```

## Color Palette

- **Slate**: Primary dark tones (backgrounds, cards)
- **Amber**: Accent color (buttons, highlights, progress)
- **Green**: Success states (completed, passed)
- **Red**: Error states (failed)

## Progress Persistence

All progress is stored in localStorage under `contractor-lms-progress`:
- Completed lessons
- Video watch progress
- Quiz scores
- Exam scores

## Adding Quiz Questions

Edit `src/data/quizzes.json` to add more questions. Format:

```json
{
  "id": "q1",
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why this is correct..."
}
```

## License

Private - For authorized use only.
