"""
Upload API – handles file upload, validation, and preview.
"""
import os
import io
import uuid
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from utils.session import create_session, set_session
from preprocessing.validator import validate

router = APIRouter()
# Project root is 2 levels up from server/api/upload.py -> server/ -> project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SERVER_DIR = PROJECT_ROOT
UPLOAD_DIR = os.path.join(PROJECT_ROOT, "uploads")
MAX_SIZE_MB = 50
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Validate file type
    allowed = {".csv", ".xlsx", ".xls"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Use CSV or Excel (.xlsx/.xls).")

    # Read content
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(413, f"File too large ({size_mb:.1f} MB). Maximum allowed: {MAX_SIZE_MB} MB.")

    # Parse
    try:
        if ext == ".csv":
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(400, f"Could not parse file: {str(e)}")

    # Validate
    validation = validate(df)
    if not validation["valid"]:
        return JSONResponse(
            status_code=422,
            content={"valid": False, "errors": validation["errors"], "warnings": validation["warnings"]},
        )

    # Create session
    session_id = create_session()
    set_session(session_id, "raw_df", df)
    set_session(session_id, "filename", file.filename)
    set_session(session_id, "validation", validation)

    # Save file
    save_path = os.path.join(UPLOAD_DIR, f"{session_id}{ext}")
    with open(save_path, "wb") as f:
        f.write(content)
    set_session(session_id, "file_path", save_path)

    # Preview
    preview_df = df.copy()
    preview_df.columns = [c.strip().lower() for c in preview_df.columns]

    date_range = "N/A"
    if "date" in preview_df.columns:
        try:
            dates = pd.to_datetime(preview_df["date"], errors="coerce").dropna()
            if len(dates) > 0:
                date_range = f"{dates.min().date()} to {dates.max().date()}"
        except Exception:
            pass

    return {
        "session_id": session_id,
        "valid": True,
        "warnings": validation["warnings"],
        "detected_columns": validation["detected_columns"],
        "preview": {
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns),
            "dtypes": {k: str(v) for k, v in df.dtypes.items()},
            "memory_usage": f"{df.memory_usage(deep=True).sum() / 1024:.1f} KB",
            "date_range": date_range,
            "head": df.head(15).fillna("").astype(str).to_dict(orient="records"),
            "null_counts": df.isna().sum().to_dict(),
        },
    }


@router.post("/upload/sample")
async def upload_sample():
    """Load the bundled sample dataset."""
    sample_path = os.path.join(SERVER_DIR, "data", "sample_sales.csv")
    if not os.path.exists(sample_path):
        raise HTTPException(404, "Sample dataset not found.")

    df = pd.read_csv(sample_path)
    validation = validate(df)

    session_id = create_session()
    set_session(session_id, "raw_df", df)
    set_session(session_id, "filename", "sample_sales.csv")
    set_session(session_id, "validation", validation)
    set_session(session_id, "file_path", sample_path)

    preview_df = df.copy()
    preview_df.columns = [c.strip().lower() for c in preview_df.columns]
    date_range = "N/A"
    if "date" in preview_df.columns:
        try:
            dates = pd.to_datetime(preview_df["date"], errors="coerce").dropna()
            date_range = f"{dates.min().date()} to {dates.max().date()}"
        except Exception:
            pass

    return {
        "session_id": session_id,
        "valid": True,
        "warnings": [],
        "detected_columns": validation["detected_columns"],
        "preview": {
            "filename": "sample_sales.csv",
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns),
            "dtypes": {k: str(v) for k, v in df.dtypes.items()},
            "memory_usage": f"{df.memory_usage(deep=True).sum() / 1024:.1f} KB",
            "date_range": date_range,
            "head": df.head(15).fillna("").astype(str).to_dict(orient="records"),
            "null_counts": df.isna().sum().to_dict(),
        },
    }
