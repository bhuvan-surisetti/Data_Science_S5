"""
SalesVision AI – FastAPI Backend Entry Point
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from api import upload, analyze, forecast, download

# Ensure directories exist
for d in ["uploads", "exports", "trained_models"]:
    os.makedirs(d, exist_ok=True)

app = FastAPI(
    title="SalesVision AI API",
    description="Intelligent Sales Forecasting & Business Analytics Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(analyze.router, prefix="/api", tags=["Analyze"])
app.include_router(forecast.router, prefix="/api", tags=["Forecast"])
app.include_router(download.router, prefix="/api", tags=["Download"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SalesVision AI"}


@app.get("/api/sample-dataset")
def get_sample_info():
    return {
        "filename": "sample_sales.csv",
        "description": "Synthetic retail sales dataset with 500 rows",
        "columns": ["Date", "Sales", "Product", "Category", "Region", "Quantity", "Discount", "Unit Price"],
    }
