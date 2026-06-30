"""
Download API – streams cleaned CSV, forecast CSV, or PDF report.
"""
import io
import os
import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response

from utils.session import get_session
from reports.pdf_generator import generate_pdf

router = APIRouter()


@router.get("/download/{session_id}/cleaned-csv")
async def download_cleaned_csv(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found.")
    cleaned_df = session.get("cleaned_df")
    if cleaned_df is None:
        raise HTTPException(400, "Analysis not run yet.")

    buf = io.StringIO()
    cleaned_df.to_csv(buf, index=False)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=salesvision_cleaned_{session_id[:8]}.csv"},
    )


@router.get("/download/{session_id}/forecast-csv")
async def download_forecast_csv(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found.")
    forecast = session.get("last_forecast")
    if not forecast or "forecast_table" not in forecast:
        raise HTTPException(400, "No forecast available.")

    df = pd.DataFrame(forecast["forecast_table"])
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=salesvision_forecast_{session_id[:8]}.csv"},
    )


@router.get("/download/{session_id}/pdf")
async def download_pdf(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found.")
    full_analysis = session.get("full_analysis")
    if not full_analysis:
        raise HTTPException(400, "Analysis not run yet.")

    pdf_bytes = generate_pdf(full_analysis, session_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=salesvision_report_{session_id[:8]}.pdf"},
    )
