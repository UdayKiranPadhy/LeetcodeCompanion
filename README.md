# LeetCode Companion

An AI-powered study tool that helps you deeply understand LeetCode problems — not just solve them.
Paste any LeetCode URL and get a structured breakdown: thought-process analysis, mathematical complexity proofs, step-by-step annotated code solutions, and a contextual follow-up chat — all streamed in real time.

## Features

- **Approach analysis** — Submit your thought process and receive structured feedback (what's correct, what's off, and why)
- **Progressive hints** — Three levels: subtle nudge → clearer direction → near-explicit guidance
- **Mathematical proofs** — Formal time/space complexity analysis with correctness proofs
- **Step-by-step code** — Annotated solutions for brute-force and optimal approaches
- **Multi-language** — Python, Java, JavaScript
- **Follow-up chat** — Contextual conversation scoped to any solution section

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite, served by nginx |
| Backend | FastAPI (Python 3.12), Google Gemini AI via `google-adk` |
| Web scraping | crawl4ai + Playwright/Chromium (headless) |
| Containerisation | Docker + Docker Compose |

---

## Prerequisites

- **Docker 24+ and Docker Compose v2** (for the Docker path)
- **OR**: Node.js 20+ and Python 3.12+ (for bare-metal local dev)
- A **Google AI Studio API key** — get one at https://aistudio.google.com/apikey

---

## Quick Start — Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/youruser/leetcode-companion
cd leetcode-companion

# 2. Create the backend env file
cp backend/.env.example backend/.env
# Open backend/.env and set: GOOGLE_API_KEY=your_actual_key

# 3. Build and start both services
docker compose up --build

# 4. Open the app
#    Frontend → http://localhost:8080
#    Backend API docs → http://localhost:8000/docs
```

> **Note:** First startup takes ~60 seconds because the backend launches and warms up headless Chromium.
> Subsequent starts are fast (browser binary is cached in the image layer).

---

## Local Development — Bare Metal

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env             # then set GOOGLE_API_KEY in .env
uvicorn index:app --reload --port 8000
```

API docs available at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
# Optional: if backend is NOT at localhost:8000, create a .env file:
#   echo "VITE_API_URL=http://your-backend-host:8000" > .env
npm run dev
# Open http://localhost:5173
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes | — | Google AI Studio API key for Gemini |
| `CORS_ORIGINS` | No | `*` | Comma-separated allowed frontend origins, or `*` for all |

Example for production:
```
GOOGLE_API_KEY=AIza...
CORS_ORIGINS=https://app.yourdomain.com,https://www.yourdomain.com
```

### Frontend — `frontend/.env` (build-time only)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

> **Important:** `VITE_API_URL` is substituted into the JavaScript bundle at **build time** by Vite.
> Changing it at runtime has no effect — you must rebuild the frontend image/bundle.

---

## Docker Reference

```bash
# Start everything (detached)
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop
docker compose down

# Rebuild only backend after code changes
docker compose up --build backend

# Build images manually with a custom API URL
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  -t lc-frontend ./frontend

docker build -t lc-backend ./backend
```

---

## Deployment

### Railway (Recommended for First Deployment)

Railway auto-detects Dockerfiles and handles HTTPS + custom domains.

1. Create a new Railway project.
2. Add a service → **Deploy from GitHub repo** → set root directory to `backend/`.
   In the service's **Variables** tab, add `GOOGLE_API_KEY` and optionally `CORS_ORIGINS`.
3. Add a second service from the same repo → set root directory to `frontend/`.
   In **Variables**, add `VITE_API_URL` pointing at your backend's Railway-generated URL.
   Railway passes Variables as Docker build args automatically when a Dockerfile is present.
4. Both services get public HTTPS URLs automatically.

### Render

1. **Backend**: New Web Service → root `backend/` → environment `Docker`.
   Add `GOOGLE_API_KEY` (and `CORS_ORIGINS`) as env vars.
2. **Frontend**: New Web Service → root `frontend/` → environment `Docker`.
   Under **Advanced → Build Environment Variables**, add `VITE_API_URL` with the backend's Render URL.
   This ensures Vite receives the variable at image build time.

### Google Cloud Run

The nginx config already includes a `/healthz` endpoint — Cloud Run uses it automatically.
The backend needs at least **2 GB RAM** for Chromium.

```bash
# Backend
docker build -t gcr.io/PROJECT_ID/lc-backend ./backend
docker push gcr.io/PROJECT_ID/lc-backend
gcloud run deploy lc-backend \
  --image gcr.io/PROJECT_ID/lc-backend \
  --set-env-vars GOOGLE_API_KEY=your_key,CORS_ORIGINS=https://YOUR_FRONTEND_URL \
  --memory 2Gi --cpu 2 --region us-central1

# Frontend (pass the backend Cloud Run URL as a build arg)
docker build \
  --build-arg VITE_API_URL=https://lc-backend-xxxx.run.app \
  -t gcr.io/PROJECT_ID/lc-frontend ./frontend
docker push gcr.io/PROJECT_ID/lc-frontend
gcloud run deploy lc-frontend \
  --image gcr.io/PROJECT_ID/lc-frontend \
  --memory 256Mi --region us-central1
```

### Self-Hosted VPS

```bash
# On the server: clone repo, configure env, start
git clone https://github.com/youruser/leetcode-companion && cd leetcode-companion
cp backend/.env.example backend/.env   # set GOOGLE_API_KEY + CORS_ORIGINS

# Build with your production backend URL
VITE_API_URL=https://api.yourdomain.com docker compose up --build -d

# Put a reverse proxy (nginx, Caddy, Traefik) in front for HTTPS + custom domains
```

---

## Project Structure

```
leetcode-companion/
├── backend/
│   ├── index.py          # FastAPI app — lifespan, CORS, router registration
│   ├── routes.py         # API endpoints (fetch-problem, analyze-thought, generate-*, send-followup)
│   ├── services.py       # Google Gemini AI client (ADK agent + streaming)
│   ├── models.py         # Pydantic request/response models
│   ├── requirements.txt
│   ├── .env.example      # Copy to .env and fill in secrets
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── services/api.ts       # API client — uses VITE_API_URL
│   │   ├── hooks/useProblem.ts   # Core state + solution generation orchestration
│   │   ├── components/           # React component tree
│   │   ├── pages/                # HomePage, ProblemPage
│   │   └── types/index.ts        # Shared TypeScript types
│   ├── nginx.conf        # Serves SPA on :8080, security headers, gzip, /healthz
│   ├── Dockerfile        # Multi-stage Node→nginx build
│   └── .env.example      # Documents VITE_API_URL
├── docker-compose.yml    # Full-stack local dev orchestration
└── README.md
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/fetch-problem` | Crawl a LeetCode URL and return structured problem data |
| `POST` | `/analyze-thought` | Evaluate user's thought process; returns feedback + hints |
| `POST` | `/generate-thought-process` | Stream expert approach explanation (SSE) |
| `POST` | `/generate-math-proof` | Stream complexity analysis + correctness proof (SSE) |
| `POST` | `/generate-code` | Stream annotated solutions for all approaches (SSE) |
| `POST` | `/send-followup` | Stream contextual follow-up answer with chat history (SSE) |
| `GET`  | `/docs` | Swagger UI (auto-generated by FastAPI) |

All SSE endpoints emit `data: {"type": "chunk", "text": "..."}` events followed by `data: [DONE]`.
JSON endpoints additionally emit `data: {"type": "result", "data": {...}}` before `[DONE]`.

---

## Known Limitations

- **`VITE_API_URL` is build-time only.** Changing the backend URL requires rebuilding the frontend image/bundle.
- **Chromium needs memory.** The backend container requires at least **2 GB RAM** in production. Cloud Run's default is 512 MB — set `--memory 2Gi`.
- **LeetCode must be reachable** from the backend container. Firewalled environments will cause problem fetching to fail.
- **CORS defaults to `*`.** Set `CORS_ORIGINS` to your frontend's origin in production.
