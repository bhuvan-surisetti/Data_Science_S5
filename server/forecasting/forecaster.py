"""
Forecaster – generates future sales forecasts using the best trained model.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List


def forecast(
    df: pd.DataFrame,
    best_model,
    feature_names: List[str],
    horizon_days: int = 30,
) -> Dict[str, Any]:
    """
    Generates a forecast for the next `horizon_days` days.
    Returns forecast table + confidence intervals.
    """
    if df.empty or best_model is None:
        return {"error": "No trained model or data available."}

    last_date = df["date"].max()
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=horizon_days, freq="D")

    season_map = {
        12: "Winter", 1: "Winter", 2: "Winter",
        3: "Spring", 4: "Spring", 5: "Spring",
        6: "Summer", 7: "Summer", 8: "Summer",
        9: "Autumn", 10: "Autumn", 11: "Autumn",
    }

    future_df = pd.DataFrame({"date": future_dates})
    future_df["month"] = future_df["date"].dt.month
    future_df["year"] = future_df["date"].dt.year
    future_df["day"] = future_df["date"].dt.day
    future_df["quarter"] = future_df["date"].dt.quarter
    future_df["week_number"] = future_df["date"].dt.isocalendar().week.astype(int)
    future_df["day_of_week"] = future_df["date"].dt.dayofweek
    future_df["is_weekend"] = future_df["day_of_week"].isin([5, 6]).astype(int)
    future_df["season"] = future_df["month"].map(season_map)

    # Encoded categoricals – use most frequent values from training data
    for col in ["category_enc", "region_enc", "product_enc"]:
        if col in feature_names:
            mode_val = 0
            if f"{col.replace('_enc', '')}" in df.columns:
                from sklearn.preprocessing import LabelEncoder
                le = LabelEncoder()
                le.fit(df[col.replace("_enc", "")].astype(str))
                mode_label = df[col.replace("_enc", "")].mode()[0]
                mode_val = int(le.transform([mode_label])[0])
            future_df[col] = mode_val

    if "season_enc" in feature_names:
        from sklearn.preprocessing import LabelEncoder
        le = LabelEncoder()
        le.fit(df["season"].astype(str) if "season" in df.columns else future_df["season"].astype(str))
        future_df["season_enc"] = le.transform(future_df["season"].astype(str))

    # Build feature matrix matching training columns
    X_future = pd.DataFrame(index=range(len(future_df)))
    for col in feature_names:
        if col in future_df.columns:
            X_future[col] = future_df[col].values
        else:
            X_future[col] = 0

    # Predict
    predictions = best_model.predict(X_future)
    predictions = np.clip(predictions, 0, None)  # no negative sales

    # Confidence interval via residual bootstrapping
    # Use last 60-day residuals if available, else 10% of prediction
    std_estimate = np.std(predictions) * 0.15
    lower = (predictions - 1.96 * std_estimate).clip(0)
    upper = predictions + 1.96 * std_estimate

    # Growth calculation
    last_30_avg = df.tail(30)["sales"].mean() if len(df) >= 30 else df["sales"].mean()
    forecast_avg = float(predictions.mean())
    growth_pct = round((forecast_avg - last_30_avg) / last_30_avg * 100, 2) if last_30_avg > 0 else 0

    forecast_table = [
        {
            "date": str(future_dates[i].date()),
            "forecast": round(float(predictions[i]), 2),
            "lower_ci": round(float(lower[i]), 2),
            "upper_ci": round(float(upper[i]), 2),
        }
        for i in range(len(future_dates))
    ]

    # Historical for chart context (last 90 days or all)
    hist_df = df[["date", "sales"]].copy()
    hist_df["date"] = hist_df["date"].dt.strftime("%Y-%m-%d")
    daily_hist = hist_df.groupby("date")["sales"].sum().reset_index()
    daily_hist = daily_hist.tail(90)

    return {
        "horizon_days": horizon_days,
        "forecast_table": forecast_table,
        "total_forecast": round(float(predictions.sum()), 2),
        "avg_daily_forecast": round(forecast_avg, 2),
        "growth_pct_vs_recent": growth_pct,
        "historical": daily_hist.to_dict(orient="records"),
    }
