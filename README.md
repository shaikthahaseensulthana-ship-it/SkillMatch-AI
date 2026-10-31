# SkillMatch AI — Sample Project

A sample React + Flask application demonstrating resume keyword analysis, sample job matching, profile editing, and demo registration/login. No API keys are required.

## Requirements
- Node.js 18+
- Python 3.10+

## Start backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
Backend: http://127.0.0.1:5000

## Start frontend in another terminal
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in your terminal.

## Important demo limitations
Data is held in memory and resets when the backend restarts. Password storage is intentionally demo-only and insecure. Do not use real credentials or real private resume data. Add secure password hashing, a database, authorization, and privacy protections before production.
