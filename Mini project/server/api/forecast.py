"""
Forecast API – re-runs forecasting with user-selected horizon.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from utils.session import get_session, set_session
from forecasting.forecaster import forecast as run_forecast

router = APIRouter()


class ForecastRequest(BaseModel):
    horizon_days: int = 30


@router.post("/forecast/{session_id}")
async def forecast(session_id: str, req: ForecastRequest):
    session = get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found.")

    featured_df = session.get("featured_df")
    best_model = session.get("best_model")
    feature_names = session.get("feature_names")

    if featured_df is None or best_model is None:
        raise HTTPException(400, "Analysis has not been run yet. Call /api/analyze first.")

    allowed = [7, 30, 90, 180, 365]
    if req.horizon_days not in allowed:
        raise HTTPException(400, f"horizon_days must be one of {allowed}.")

    result = run_forecast(featured_df, best_model, feature_names, horizon_days=req.horizon_days)
    set_session(session_id, "last_forecast", result)
    return result
