# DRDO RAC Expert Relevance & Matching System

AI-assisted expert relevance analysis and interview board matching system designed for the Defence Research and Development Organisation (DRDO) Recruitment and Assessment Centre (RAC).

---

## 📁 Repository Structure

```
DRDO-RAC-Expert-System/
├── frontend/               # Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons
│   ├── app/                # Next.js application routes & presentation
│   ├── components/         # RAC Intelligence UI components
│   ├── data/               # Static/mock datasets (boards, candidates, experts)
│   ├── lib/                # Shared utilities and type definitions
│   ├── public/             # Static assets & brand icons
│   ├── services/           # Frontend service modules (matching, expert retrieval)
│   ├── package.json        # Frontend package configuration (pnpm/npm)
│   └── tsconfig.json       # Frontend TypeScript configuration
│
├── backend/                # Node.js, Express 5, TypeScript, MongoDB Atlas
│   ├── src/
│   │   ├── config/         # Database and environment configurations
│   │   ├── routes/         # Express API routes (health check, expert endpoints)
│   │   ├── app.ts          # Express application initialization & middleware
│   │   └── server.ts       # Server entry point & graceful shutdown
│   ├── .env.example        # Environment variable template
│   ├── package.json        # Backend package configuration
│   └── tsconfig.json       # Backend TypeScript configuration
│
├── docs/                   # Architecture, API specifications, and project documentation
├── .gitignore              # Monorepo-level Git ignore configuration
└── README.md               # Main project README
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (Node.js v20+ recommended)
- **pnpm** or **npm**
- **MongoDB Atlas** database cluster

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and provide your MONGODB_URI and PORT
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

* Backend Health Check: `http://localhost:5000/health`
* Backend API Root: `http://localhost:5000/`

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install
# or: npm install

# Run development server
pnpm dev
# or: npm run dev
```

* Frontend Application: `http://localhost:3000`

---

## 🔒 Security Note

- Never commit `.env` or `.env*.local` files to Git.
- Always use `.env.example` as a template for team members and deployment pipelines.

