# 🏛️ Public Fund Utilization and Civic Spending Transparency Dashboard

> An interactive civic intelligence web dashboard designed to consolidate public budget allocations and expenditures across municipal wards and departments into standardized KPIs, drill-down analytics, oversight flags, and public disclosure reports.

---

## ✨ Features

- 📊 **City & Ward Level Visualizations**: Compare budget allocation vs expenditure using interactive Recharts (Bar, Donut, and Trend Area Charts).
- 🏙️ **Ward Drill-Down**: View elected representatives, region badges, execution rates, and individual project status (*Planned*, *In Progress*, *Completed*).
- 🚨 **Automated Oversight Flags**: Automatic warning alerts for wards with low fund utilization (< 70%).
- 📥 **CSV Data Ingestion**: Drag-and-drop CSV upload with real-time record validation and deduplication feedback.
- 📑 **Public Disclosure Export**: One-click streaming export of spending reports as downloadable CSV files.
- ⚡ **Vercel Serverless Ready**: Configured for instant deployment on Vercel (FastAPI serverless backend + React Vite frontend).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Recharts, Lucide React, Axios, React Router v6
- **Backend**: FastAPI (Python), Pandas (Data Cleaning & Validation), Uvicorn
- **Database**: SQLite (`civic_funds.db` with 840 project records), SQLAlchemy ORM
- **Deployment**: Vercel Serverless Functions (`@vercel/python` + `@vercel/static-build`)

---

## 🚀 Getting Started

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m uvicorn main:app --port 8000 --reload
```

### 2. Frontend Setup (React Vite)
```bash
cd frontend
npm install
npm run dev
```

Visit the dashboard in your browser at `http://localhost:5173`.

---

## 📁 Project Structure

```text
public-fund-transparency-dashboard/
├── api/                      # Vercel Serverless Entrypoint (index.py)
├── backend/                  # FastAPI Backend & SQLite Database (main.py, models.py, database.py)
├── frontend/                 # React Vite SPA Frontend (src/, package.json, index.html)
├── vercel.json               # Vercel Deployment & Route Proxies
├── requirements.txt          # Python Dependencies for Vercel
├── package.json              # Root script runner
└── README.md
```
