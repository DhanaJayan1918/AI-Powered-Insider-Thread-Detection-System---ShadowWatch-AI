# ShadowWatch AI - Enterprise Setup & Installation Guide

This guide walks through setting up and launching ShadowWatch AI locally or via Docker containers.

---

## Environment Requirements

- Python 3.10+ (Python 3.13 recommended)
- Node.js 18+ (Node 20+ recommended)
- Docker & Docker Compose (Optional for containerized deployment)
- MongoDB (Optional; automatic In-Memory Store Fallback is built-in)

---

## 1. Local Development Setup

### Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install openpyxl pandas numpy scikit-learn shap networkx pyvis fastapi uvicorn pydantic pydantic-settings motor pymongo google-genai pytest python-multipart

# Launch Backend Server:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at `http://localhost:8000/docs`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 2. Docker Compose Deployment

```bash
# Set Gemini API Key (Optional)
export GEMINI_API_KEY="your_api_key_here"

# Build and Start Containers
docker-compose up --build
```

Services launched:
- Frontend SOC Dashboard: `http://localhost:3000`
- FastAPI Backend: `http://localhost:8000`
- MongoDB Database: `localhost:27017`

---

## 3. Running Automated Tests

```bash
cd backend
venv\Scripts\python.exe -m pytest tests/test_backend.py
```
