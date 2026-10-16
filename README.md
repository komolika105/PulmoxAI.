# PulmoXAI

An AI-assisted chest X-ray analysis tool that scans an image, predicts the likely condition, and visually explains what the AI focused on — built to be understandable, not a black box.

## Stack

React + Vite + Tailwind CSS + Recharts + Lucide + Axios + React Router.

## Getting Started (Windows)

Prerequisites: Node.js and Python 3.11. TensorFlow is pinned to 2.15.1 for the included Model3 artifact. Use the single backend environment at `backend/venv`.

### 1. Install backend dependencies

From the project root in PowerShell:

```powershell
py -3.11 -m venv backend\venv
.\backend\venv\Scripts\python.exe -m pip install --upgrade pip
.\backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

If `backend\venv` already exists and works, skip the first command. The Model3 files under `backend\Model3` must remain in place.

### 2. Start the backend

In the same terminal:

```powershell
Set-Location backend
.\venv\Scripts\python.exe -m uvicorn app:app --reload
```

Keep this terminal running. The API health check is available at `http://127.0.0.1:8000/api/health`.

### 3. Start the frontend

Open a second terminal at the project root:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. For local development, the frontend defaults to `http://127.0.0.1:8000`; a root `.env` is only needed when the backend runs at a different address. Optional Gemini and JWT settings belong in `backend/.env`. Gemini requests use a 10-second timeout by default (the API requires at least 10 seconds); set `GEMINI_TIMEOUT_MS` there to use a longer limit.

## Pages

- **Dashboard** (`/`) — landing page, how-it-works, entry point to analysis
- **Analyze X-Ray** (`/analyze`) — upload → prediction → probability chart → segmentation viewer → Grad-CAM / Grad-CAM++ / LIME explanations, all on one page
- **History** (`/history`) — past analyses, searchable/filterable
- **About** (`/about`)
- **Sign up / Sign in** (`/signup`, `/login`) — account creation, currently local-only (see [Auth](#auth--connecting-a-real-backend) below)
- **Profile** (`/profile`) — protected route, shows account info and recent scans

## Backend Contract — Image Analysis

`POST /api/predict` — multipart form field `file` (JPG/JPEG/JPE/PNG chest X-ray) →

```json
{
  "prediction": "Pneumonia",
  "confidence": 0.94,
  "probabilities": {
    "Normal": 0.03,
    "Pneumonia": 0.94,
    "Tuberculosis": 0.02,
    "Other": 0.01
  },
  "classes": ["Normal", "Pneumonia", "Tuberculosis", "Other"],
  "original_image": "...",
  "segmentation_image": "...",
  "gradcam_image": "...",
  "gradcam_plus_image": "...",
  "lime_image": "...",
  "inference_time": 0.128,
  "timings_ms": {
    "preprocessing": 18,
    "segmentation": 31,
    "classification": 42,
    "xai_generation": 76,
    "total": 167
  },
  "model_size_mb": 30.8,
  "uncertainty": "Low",
  "calibration_status": "Calibrated (temperature scaling)",
  "explanation_quality": {
    "localization_score": 0.81,
    "faithfulness_score": 0.77,
    "iou": 0.68,
    "dice_score": 0.74
  }
}
```

If the backend is unreachable, the UI automatically falls back to a clearly labeled **Demo Mode** — see `src/services/mockData.js`. Real performance/evaluation metrics are never fabricated in code.

## Auth — Connecting a Real Backend

`src/services/authApi.js` currently runs in `LOCAL_MODE` (accounts stored in `localStorage`, for frontend development without a backend). To connect a real backend:

1. Implement `POST /api/auth/signup` and `POST /api/auth/login` on your FastAPI server, each returning `{ token, user: { id, name, email, createdAt } }`.
2. In `src/services/authApi.js`, set `LOCAL_MODE = false`. The axios calls to swap in are already written right below the local-mode branch in `signup()` and `login()`.
3. If you want token-based auth, store the token from the response (e.g. in `localStorage` or an httpOnly cookie set by the backend) and attach it to `services/api.js`'s axios instance as an `Authorization` header.

No component code needs to change — `AuthContext` and every page consume `authApi.js` through the same interface either way.

## Structure

```
src/
├── components/   Navbar, ImageUploader, PredictionCard, ProbabilityChart,
│                 SegmentationViewer, ExplainabilityViewer, PerformanceCard,
│                 Disclaimer, LoadingState, PageHeader, Footer, ProtectedRoute
├── pages/        Dashboard, Analyze, History, About, Login, SignUp, Profile
├── context/      AuthContext.jsx
├── services/     api.js (prediction backend contract), authApi.js (auth contract),
│                 mockData.js (demo mode)
├── hooks/        usePrediction.js
└── utils/        formatters.js
```

## Disclaimer

This tool is intended for research and educational purposes only. It is **not** a certified diagnostic device and should not be used as a substitute for professional medical advice, diagnosis, or treatment.
