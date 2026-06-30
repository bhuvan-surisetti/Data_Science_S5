# SalesVision AI – Quick Start Guide

## Prerequisites
- Python 3.9+
- Node.js 18+

## Setup & Run

### 1. Install Backend Dependencies
```bash
cd server
pip install -r ../requirements.txt
```

### 2. Generate Sample Dataset
```bash
cd server
python generate_sample.py
```

### 3. Start the Backend (Terminal 1)
```bash
cd server
uvicorn main:app --reload --port 8000
```
Backend runs at: http://localhost:8000
API docs: http://localhost:8000/docs

### 4. Start the Frontend (Terminal 2)
```bash
cd client
npm install  # (already done if you followed setup)
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Usage

1. Open http://localhost:5173
2. Upload your CSV/Excel file (or click **Try Sample Dataset**)
3. Click **Analyze Dataset**
4. Explore the 10-step analysis in the dashboard

## Supported CSV Columns
| Column | Required | Description |
|--------|----------|-------------|
| Date | ✅ Yes | Any standard date format |
| Sales | ✅ Yes | Numeric revenue value |
| Product | Optional | Product name |
| Category | Optional | Product category |
| Region | Optional | Sales region |
| Quantity | Optional | Units sold |
| Discount | Optional | Discount rate (0.0–1.0) |
| Unit Price | Optional | Price per unit |

## Architecture
```
client/      → React + TypeScript + Vite + Plotly.js
server/      → Python + FastAPI + Pandas + Scikit-learn
uploads/     → Uploaded files (temporary)
exports/     → Generated downloads
data/        → Sample dataset
```
