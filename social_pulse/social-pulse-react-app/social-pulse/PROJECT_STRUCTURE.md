# Social Pulse - Project Structure

## Directory Tree

```
social-pulse/
├── public/                     # Static assets
├── src/
│   ├── assets/                # Images, fonts, etc.
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthPage.jsx           # Login/Register page
│   │   ├── common/
│   │   │   └── Layout.jsx             # App layout with sidebar
│   │   ├── dataset/
│   │   │   └── DatasetStudio.jsx      # File upload & data preview
│   │   ├── refinery/
│   │   │   └── Refinery.jsx           # Data cleaning controls
│   │   ├── insights/
│   │   │   └── InsightsLab.jsx        # EDA visualizations
│   │   ├── ml/
│   │   │   └── MLStudio.jsx           # ML training interface
│   │   └── visualization/
│   │       └── VisionDeck.jsx         # Main dashboard
│   ├── context/
│   │   └── DataContext.jsx            # Global state management
│   ├── hooks/                 # Custom React hooks (future)
│   ├── utils/                 # Utility functions (future)
│   ├── styles/
│   │   └── index.css          # Global styles & Tailwind
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── .eslintrc.cjs              # ESLint configuration
├── .gitignore                 # Git ignore rules
├── index.html                 # HTML template
├── package.json               # Dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vite.config.js             # Vite configuration
└── README.md                  # Project documentation

## Key Files Explained

### Core Application
- **main.jsx**: Application entry point, renders React app
- **App.jsx**: Router configuration and route protection
- **DataContext.jsx**: Global state for data management

### Pages (Components)
1. **AuthPage**: Glassmorphism login/register with split screen
2. **DatasetStudio**: Drag & drop upload with data health analysis
3. **Refinery**: Interactive data preprocessing with visual feedback
4. **InsightsLab**: Bento grid layout with charts and insights
5. **MLStudio**: Cinematic ML training with terminal-style logs
6. **VisionDeck**: Comprehensive dashboard with animated KPIs

### Layout
- **Layout.jsx**: Persistent sidebar navigation and top bar

## Features Implemented

✅ Authentication (mock - accepts any credentials)
✅ File upload (CSV support)
✅ Demo data loading
✅ Data health metrics
✅ Data cleaning controls
✅ Interactive visualizations
✅ ML training simulations
✅ Animated KPI counters
✅ Responsive design
✅ Dark theme with neon accents
✅ Glassmorphism effects
✅ Framer Motion animations
✅ Protected routes

## Technology Stack

- React 18.2
- Vite 5.1
- React Router DOM 6.22
- Framer Motion 11.0
- Recharts 2.12
- Lucide React 0.344
- React Dropzone 14.2
- Tailwind CSS 3.4
- PostCSS & Autoprefixer

## Getting Started

1. Extract the ZIP file
2. Open terminal in project directory
3. Run: npm install
4. Run: npm run dev
5. Open: http://localhost:3000

## Quick Demo

1. Login with any email/password
2. Load Demo Data on Dataset Studio
3. Navigate through all pages
4. Experience the animations and interactions

## Notes

- All data processing is client-side
- No backend required
- Mock authentication (any credentials work)
- Demo data auto-generates on load
- Fully responsive (desktop & tablet optimized)
