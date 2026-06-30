#!/usr/bin/env bash
# Quick start script for SalesVision AI

echo "=== SalesVision AI Startup ==="

# Generate sample dataset
echo "[1/3] Generating sample dataset..."
python generate_sample.py

# Start backend
echo "[2/3] Starting FastAPI backend on port 8000..."
uvicorn main:app --reload --port 8000 --host 0.0.0.0
