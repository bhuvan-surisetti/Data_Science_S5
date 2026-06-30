# SalesVision AI – Intelligent Sales Forecasting & Business Analytics Platform

SalesVision AI is a full-stack, state-of-the-art web application designed to turn raw transaction logs, CSVs, or Excel files into clean, feature-rich datasets, interactive dashboards, trained machine learning models, and automated business insights.

---

## 📊 End-to-End System Workflow

SalesVision AI processes data through a structured pipeline. The flow below maps how data moves from user upload to the final analytics dashboard:

```mermaid
flowchart TD
    subgraph Client [Client - React & Vite]
        UI["Landing / Upload UI"]
        Dash["Dashboard & KPIs"]
        EDA["Plotly EDA Charts"]
        ML_UI["ML Benchmarks"]
        FC_UI["Forecast Horizon Control"]
    end

    subgraph Server [Server - FastAPI]
        VLD["1. Validator (validator.py)"]
        CLN["2. Cleaner (cleaner.py)"]
        FE["3. Feature Engineer (feature_engineer.py)"]
        KPIS["4. KPI Engine"]
        ML["5. ML Trainer (trainer.py)"]
        FC["6. Forecaster (forecaster.py)"]
        INS["7. Insight Generator (generator.py)"]
    end

    UI -->|POST /api/upload| VLD
    VLD -->|Validates columns & returns session_id| UI
    UI -->|POST /api/analyze/{session_id}| CLN
    CLN -->|Handles missing/outliers| FE
    FE -->|Extracts seasonal/date features| KPIS
    KPIS -->|Aggregates sales metrics| ML
    ML -->|Trains & benchmarks 6 Regressors| FC
    FC -->|Projects sales & confidence intervals| INS
    INS -->|Synthesizes NLP observations| UI
    UI -->|Binds payload to state| Dash
    UI -->|Renders interactive charts| EDA
    UI -->|Displays ML metrics & importances| ML_UI
    FC_UI -->|POST /api/forecast (N days)| FC
```

---

## 🛠️ Detailed Stage-by-Stage Breakdown

### 1. File Upload & Column Validation
- **Endpoint:** `POST /api/upload`
- **Logic:** Users upload a CSV or Excel file (or click **Try Sample Dataset**). The system instantiates a temporary session.
- **Validation Rules (`server/preprocessing/validator.py`):**
  - **Required Columns:** `Date` and `Sales` (case-insensitive, automatically mapped to lowercase).
  - **Optional Columns:** `Product`, `Category`, `Region`, `Quantity`, `Discount`, `Unit Price`.
  - Check for sufficient data size (minimum rows).

### 2. Data Cleaning & Outlier Management
- **Logic (`server/preprocessing/cleaner.py`):**
  - **Missing Values:** Imputes numerical fields (e.g., using forward/backward fill or median) and handles empty string categoricals.
  - **Outliers:** Detects extreme sales values using the Interquartile Range (IQR) method and clamps them to the outer boundaries.
  - **Duplicates:** Deduplicates identical rows.
  - **Type Casting:** Parses dates, and forces sales metrics to positive floats.

### 3. Temporal Feature Engineering
- **Logic (`server/preprocessing/feature_engineer.py`):**
  - Extracts temporal components from the validated `date` column:
    - **Cyclical & Calendrical:** `year`, `month`, `day`, `quarter`, `week_number`, `day_of_week`.
    - **Socio-temporal:** `is_weekend` (binary flag).
    - **Meteorological/Seasonal:** Maps calendar months to meteorological seasons (`Winter`, `Spring`, `Summer`, `Autumn`).

### 4. Key Performance Indicator (KPI) Aggregation
- **Logic (`server/api/analyze.py`):**
  - Aggregates overall business numbers: Total Revenue, Average Order Value (AOV), Max Transaction Value, Total Order Volume, and Growth Percentage (comparing first half vs second half).
  - Groups sales metrics by Category, Region, and Product (identifying top-selling and bottom-selling items).

### 5. Automated ML Model Selection & Benchmarking
- **Logic (`server/models/trainer.py`):**
  - Separates data into features ($X$) and target ($y$) variables. Encodes categorical variables (Product, Category, Region, Season) via `LabelEncoder`.
  - Performs an 80/20 train-test split.
  - Benchmarks multiple regressor models:
    - **Linear Regression**
    - **Decision Tree Regressor**
    - **Random Forest Regressor** (Ensemble)
    - **Gradient Boosting Regressor** (Boosting)
    - **Extra Trees Regressor** (Ensemble)
    - **XGBoost** (if library is present)
  - Scores each model on: **R² Score**, **Mean Absolute Error (MAE)**, and **Root Mean Squared Error (RMSE)**.
  - Captures and flags the **best-performing model** based on R² value.
  - Computes and lists relative **Feature Importance** values.

### 6. Residual-Based Forecasting
- **Logic (`server/forecasting/forecaster.py`):**
  - Generates future dates (customizable horizon: 30, 60, or 90 days).
  - Feeds future temporal parameters (week numbers, weekends, seasons) into the selected best model to predict sales.
  - Estimates confidence bounds (95% CI) using **residual standard deviation bootstrapping** based on predictions.

### 7. Natural Language Insight Generation
- **Logic (`server/insights/generator.py`):**
  - Analyzes the cleaned and engineered metrics to produce natural-language bullet points highlighting business trends:
    - Seasonality patterns (e.g., peak revenue seasons).
    - Day-of-week anomalies (e.g., weekend vs weekday sales variance).
    - Category & regional breakdowns.
    - Product contribution stats.

---

## ⚡ API Reference

| Endpoint | Method | Description | Payload / Parameters |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | Health check for the server. | None |
| `/api/sample-dataset` | `GET` | Metadata for the sample retail sales dataset. | None |
| `/api/upload` | `POST` | Uploads a raw CSV/Excel file, validates columns, and returns a session ID. | `file` (Multipart Form Data) |
| `/api/analyze/{session_id}`| `POST` | Triggers data cleaning, feature engineering, ML benchmarking, and insight creation. | None |
| `/api/forecast/{session_id}`| `POST` | Regenerates predictions with a specified day horizon. | `horizon_days` (JSON body) |
| `/api/download/cleaned/{session_id}` | `GET` | Downloads the cleaned CSV file. | None |
| `/api/download/report/{session_id}` | `GET` | Generates and downloads a PDF business report. | None |

---

## 💻 Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Data Engineering:** Pandas, NumPy
- **Machine Learning:** Scikit-learn, XGBoost (optional)
- **Web Server:** Uvicorn

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** CSS Variables + TailwindCSS
- **Visualizations:** Plotly.js / React-Plotly
- **Icons & Transitions:** Lucide React, Framer Motion

---

## 🚀 Setup & Run Instructions

### 1. Install Backend Dependencies
Navigate to the server directory and install requirements:
```bash
cd server
pip install -r ../requirements.txt
```

### 2. Generate Sample Dataset
Run the sample data generator script to populate a synthetic dataset:
```bash
cd server
python generate_sample.py
```

### 3. Start the Backend Server (Terminal 1)
```bash
cd server
uvicorn main:app --reload --port 8000
```
- API Docs will be available at: http://localhost:8000/docs

### 4. Start the Frontend Dev Server (Terminal 2)
```bash
cd client
npm install
npm run dev
```
- The frontend will be running at: http://localhost:5173

---

## 📁 Repository Structure

```
├── client/                 # React frontend application
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── assets/         # App logos / images
│   │   ├── components/     # Reusable UI widgets (Charts, KPI Cards, Sidebar, UploadZone)
│   │   ├── context/        # Global analysis state context
│   │   ├── hooks/          # React hooks (e.g. useDarkMode)
│   │   ├── pages/          # Layouts (Dashboard, EDA, Insights, Forecast, ML, Settings)
│   │   ├── services/       # Axios API client functions
│   │   └── utils/          # Formatting and configuration utilities
│   ├── tailwind.config.js  # Tailwind utility configuration
│   └── vite.config.ts      # Vite bundler configuration
│
├── server/                 # FastAPI Python backend application
│   ├── api/                # Route handlers (upload, analyze, forecast, download)
│   ├── preprocessing/      # Data pipelines (validator, cleaner, feature_engineer)
│   ├── models/             # Machine learning module (trainer)
│   ├── forecasting/        # Forecasting logic (forecaster)
│   ├── insights/           # Natural language engine (generator)
│   ├── reports/            # PDF generation (pdf_generator)
│   ├── tests/              # Core unit test suite
│   ├── generate_sample.py  # Utility to build synthetic retail data
│   └── main.py             # Server entry point
│
├── data/                   # Default storage for raw sample data
├── requirements.txt        # Python package definitions
└── README.md               # Quick start and workflow guide (this file)
```
