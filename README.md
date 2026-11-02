# DRDO RAC Expert Relevance & Matching System

> **Project Title:** Determining Expert Relevance with Respect to Interview Board Subject and Candidates' Area of Expertise.  
> **Target Organization:** Recruitment and Assessment Centre (RAC), Defence Research and Development Organisation (DRDO).

---

## 📋 Executive Overview

The **DRDO RAC Expert Relevance System** is an AI-assisted decision-support platform designed to automate and explain the matching of domain experts to interview boards. By contextually evaluating an interview board's core subject, candidate pool specializations, research outputs, and expert credentials, the system generates transparent relevance scores and actionable recommendations for board constitution.

---

## 🏗️ System Architecture

The application is structured as a full-stack monorepo featuring four coordinated tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Tier                           │
│  Next.js 16 (App Router) · React 19 · Tailwind CSS · Lucide  │
│  - Interactive Workspace & Wizard Forms                     │
│  - Real-time PDF Resume Upload & Profile Preview            │
│  - 9-Stage AI Matching Pipeline & Decision-Support Visuals  │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP / REST / JSON & Multipart
┌──────────────────────────────▼──────────────────────────────┐
│                    Application Server                       │
│       Node.js · Express 5 · TypeScript (ES2022 CommonJS)    │
│  - RESTful CRUD Controllers & Parameter Validation          │
│  - Multer PDF Upload Middleware                             │
│  - 5-Factor Weighted Relevance Matching Service             │
│  - Explainability & Justification Generator                 │
└───────────────▲─────────────────────────────▲───────────────┘
                │                             │
    JSON IPC via stdio              Mongoose ODM / TLS
                │                             │
┌───────────────▼─────────────┐ ┌─────────────▼───────────────┐
│     Resume Parser Engine    │ │      Database Layer         │
│     Python 3.14 · pypdf     │ │       MongoDB Atlas         │
│  - Text & Section Extraction│ │  - Experts Collection       │
│  - Pattern & Entity Parsing │ │  - Candidates Collection    │
│  - Skill & Domain Mapping   │ │  - Boards Collection        │
│  - Experience Calculation   │ │  - MatchingResults Cache    │
└─────────────────────────────┘ └─────────────────────────────┘
```

### Monorepo Structure

```
DRDO-RAC-Expert-System/
├── frontend/                     # Next.js 16 Web Application
│   ├── app/                      # Next.js App Router (Layouts & Pages)
│   ├── components/               # RAC Intelligence React Components (rac-app.tsx)
│   ├── data/                     # Seed fallback datasets (experts, candidates, boards)
│   ├── services/                 # API adapters & REST client (api.ts)
│   ├── types/                    # Frontend TypeScript interfaces
│   ├── package.json              # Web dependencies & scripts
│   └── tsconfig.json             # Frontend strict TypeScript config
│
├── backend/                      # Express 5 & Node.js REST API
│   ├── python/                   # Python extraction engine
│   │   └── extract_resume.py     # pypdf parsing & domain extraction script
│   ├── src/
│   │   ├── config/               # Database connection (MongoDB Atlas)
│   │   ├── controllers/          # Business logic (Expert, Candidate, Board, Resume, Match)
│   │   ├── middleware/           # ObjectId validation & Multer PDF upload
│   │   ├── models/               # Mongoose Schemas (Expert, Candidate, Board, MatchingResult)
│   │   ├── routes/               # Express Routers
│   │   ├── services/             # Matching algorithm & Python parser bridge
│   │   ├── app.ts                # App initialization & route mounting
│   │   └── server.ts             # HTTP server entry point & shutdown handlers
│   ├── uploads/                  # Temporary storage for uploaded resumes
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies & scripts
│   └── tsconfig.json             # Backend strict TypeScript config
│
├── docs/                         # Architecture & API documentation
├── .gitignore                    # Monorepo git ignore rules
└── README.md                     # Project documentation
```

---

## 📐 Weighted Relevance Matching Formula

Relevance is **dynamic and contextual**—an expert's score is computed strictly with respect to a designated interview board and its assigned candidate pool.

$$\text{Final Score} = (0.30 \times S_{\text{board}}) + (0.30 \times S_{\text{cand}}) + (0.20 \times S_{\text{research}}) + (0.10 \times S_{\text{exp}}) + (0.10 \times S_{\text{skills}})$$

### Criteria & Weight Breakdown

| Factor | Weight | Scoring Mechanism | Rationale |
| :--- | :---: | :--- | :--- |
| **Board Subject Alignment** ($S_{\text{board}}$) | **30%** | Semantic & keyword overlap between board subject, required domains, and expert skills/specialization. Synonyms normalized (e.g., CV $\leftrightarrow$ Computer Vision, AI $\leftrightarrow$ Artificial Intelligence). | Ensures foundational competence in the board's designated subject matter. |
| **Candidate Expertise Alignment** ($S_{\text{cand}}$) | **30%** | Coverage ratio between candidate pool required skills/research areas and expert capabilities. | Guarantees the expert can critically evaluate specific candidate projects and specializations. |
| **Research & Domain Alignment** ($S_{\text{research}}$) | **20%** | Intersection of expert research areas, published papers, and patent portfolios with board domain tags. | Rewards deep domain scholarship and state-of-the-art technological insight. |
| **Experience Alignment** ($S_{\text{exp}}$) | **10%** | Scale: 15+ years = 100%, 10–14 years = 85%, 5–9 years = 70%, 2–4 years = 50%, <2 years = 30%. | Reflects seniority and RAC interview panel maturity requirements. |
| **Technical Skills Alignment** ($S_{\text{skills}}$) | **10%** | Direct match ratio across specialized tooling, frameworks, languages, and technical keywords. | Verifies hands-on familiarity with modern implementation tools. |

### Classification Thresholds

- **Score $\ge$ 75.0%**: Status `recommended` (High Relevance)
- **50.0% $\le$ Score $<$ 75.0%**: Status `under_review` (Moderate Relevance)
- **Score $<$ 50.0%**: Status `rejected` (Low Relevance)

---

## 📄 Resume Upload & Processing Workflow

```
[User PDF File]
      │
      ▼
1. POST /api/resumes/upload (Multipart FormData)
      │
      ▼
2. Multer Middleware: Validates 10MB limit and PDF MIME type ('application/pdf')
      │
      ▼
3. Node.js invokes Python Child Process: python backend/python/extract_resume.py <filepath>
      │
      ▼
4. pypdf Extracts Text & Regex Extracts:
   - Full Name & Email
   - Educational Degree (Ph.D., M.Tech, B.Tech, etc.)
   - Organization & Current Designation
   - Years of Professional Experience
   - Technical Skills & Domain Keywords
   - Research Specializations, Projects, and Publications
      │
      ▼
5. JSON returned to Express → Transmitted to React UI
      │
      ▼
6. Frontend pre-populates Expert or Candidate Creation Form with 100% editable fields
```

---

## 🔌 API Endpoint Catalog

Base URL: `http://localhost:5000/api`

### 1. Expert Management (`/api/experts`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/experts` | Register a new expert profile |
| `GET` | `/api/experts` | Retrieve all experts (supports `?page`, `?limit`, `?specialization`) |
| `GET` | `/api/experts/:id` | Fetch expert details by MongoDB ObjectId |
| `PUT` | `/api/experts/:id` | Update expert fields (guarded against `_id` and timestamp mutation) |
| `DELETE` | `/api/experts/:id` | Remove an expert profile |

### 2. Candidate Management (`/api/candidates`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/candidates` | Register a new candidate profile |
| `GET` | `/api/candidates` | Retrieve all candidates (supports `?page`, `?limit`, `?specialization`) |
| `GET` | `/api/candidates/:id` | Fetch candidate details by MongoDB ObjectId |
| `PUT` | `/api/candidates/:id` | Update candidate fields |
| `DELETE` | `/api/candidates/:id` | Remove a candidate record |

### 3. Interview Board Management (`/api/interview-boards`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/interview-boards` | Create board (validates candidate ObjectIds exist in DB) |
| `GET` | `/api/interview-boards` | Retrieve all boards with populated candidate records |
| `GET` | `/api/interview-boards/:id` | Fetch single board with populated candidate profiles |
| `PUT` | `/api/interview-boards/:id` | Update board title, subject, required expertise, or candidate IDs |
| `DELETE` | `/api/interview-boards/:id` | Delete interview board |

### 4. Resume Intelligence (`/api/resumes`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/resumes/upload` | Upload PDF resume; returns extracted structured profile data |

### 5. Matching Engine (`/api/matching`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/matching/boards/:boardId/run` | Execute 5-factor matching algorithm across all experts for a board |
| `GET` | `/api/matching/boards/:boardId/results` | Retrieve ranked matching results for a board |
| `GET` | `/api/matching/boards/:boardId/results/:expertId` | Fetch detailed score breakdown, matched domains, and explanations for an expert |
| `PUT` | `/api/matching/boards/:boardId/results/:expertId/status` | Update expert status on board (`recommended`, `under_review`, `rejected`) |

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js**: v20+ recommended (minimum v18)
- **Python**: v3.10+ (with `pypdf` installed: `pip install pypdf`)
- **MongoDB**: MongoDB Atlas connection string or local MongoDB instance

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/nisha-98/DRDO-RAC-Expert-System.git
cd DRDO-RAC-Expert-System
```

---

### Step 2: Backend Setup
```bash
cd backend

# Install npm dependencies
npm install

# Install Python resume parsing library
pip install pypdf

# Configure environment variables
# Copy .env.example to .env and configure MONGODB_URI and PORT
cp .env.example .env

# Verify TypeScript compilation
npm run build

# Start backend development server
npm run dev
```

- Server starts at: `http://localhost:5000`
- Health check: `http://localhost:5000/health`
- API documentation: `http://localhost:5000/`

---

### Step 3: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- Web Application opens at: `http://localhost:3000`
- Workspace: `http://localhost:3000/workspace`
- Boards: `http://localhost:3000/interview-boards`
- Candidates: `http://localhost:3000/candidates`
- Experts: `http://localhost:3000/experts`
- Matching Setup: `http://localhost:3000/matching/setup`

---

## 🔒 Security & Best Practices

- **Zero Secrets Committed:** Environment variables (`.env`) and credentials are fully git-ignored.
- **Input Sanitation:** All IDs are validated through Mongoose ObjectId middleware to prevent NoSQL injection.
- **File Upload Security:** Multer enforces a 10MB file limit and strictly accepts `application/pdf`.
- **Explainability:** AI outputs provide deterministic, formulaic breakdowns to guarantee institutional compliance with DRDO RAC hiring regulations.
