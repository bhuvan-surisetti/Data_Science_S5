"""
Analyze API – runs the full pipeline: clean → feature engineer → EDA → ML → insights.
"""
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException

from utils.session import get_session, set_session
from preprocessing.cleaner import clean
from preprocessing.feature_engineer import engineer_features
from models.trainer import train_models
from forecasting.forecaster import forecast as run_forecast
from insights.generator import generate_insights

router = APIRouter()


def _compute_kpis(df: pd.DataFrame, featured: dict) -> dict:
    total_revenue = float(df["sales"].sum())
    avg_sales = float(df["sales"].mean())
    max_sale = float(df["sales"].max())
    min_sale = float(df["sales"].min())
    median_sale = float(df["sales"].median())
    total_orders = int(len(df))

    # Growth: compare first half vs second half
    half = len(df) // 2
    first_half = df["sales"].iloc[:half].sum()
    second_half = df["sales"].iloc[half:].sum()
    growth_pct = round((second_half - first_half) / first_half * 100, 2) if first_half > 0 else 0

    kpis = {
        "total_revenue": round(total_revenue, 2),
        "avg_sales": round(avg_sales, 2),
        "max_sale": round(max_sale, 2),
        "min_sale": round(min_sale, 2),
        "median_sale": round(median_sale, 2),
        "total_orders": total_orders,
        "growth_pct": growth_pct,
    }

    if "product" in df.columns:
        prod_sales = df.groupby("product")["sales"].sum()
        kpis["highest_selling_product"] = str(prod_sales.idxmax())
        kpis["lowest_selling_product"] = str(prod_sales.idxmin())
        kpis["unique_products"] = int(df["product"].nunique())

    if "category" in df.columns:
        cat_sales = df.groupby("category")["sales"].sum()
        kpis["best_category"] = str(cat_sales.idxmax())
        kpis["worst_category"] = str(cat_sales.idxmin())
        kpis["unique_categories"] = int(df["category"].nunique())

    if "region" in df.columns:
        region_sales = df.groupby("region")["sales"].sum()
        kpis["best_region"] = str(region_sales.idxmax())
        kpis["worst_region"] = str(region_sales.idxmin())
        kpis["unique_regions"] = int(df["region"].nunique())

    if "discount" in df.columns:
        kpis["avg_discount_pct"] = round(float(df["discount"].mean()) * 100, 2)

    return kpis


def _compute_eda_charts(df: pd.DataFrame) -> dict:
    charts = {}

    # Daily sales trend
    if "date" in df.columns:
        daily = df.groupby(df["date"].dt.date)["sales"].sum().reset_index()
        daily.columns = ["date", "sales"]
        daily["date"] = daily["date"].astype(str)
        charts["daily_trend"] = daily.to_dict(orient="records")

    # Monthly sales
    if "year" in df.columns and "month" in df.columns:
        monthly = df.groupby(["year", "month"])["sales"].sum().reset_index()
        monthly["label"] = monthly["year"].astype(str) + "-" + monthly["month"].astype(str).str.zfill(2)
        charts["monthly_sales"] = monthly[["label", "sales"]].to_dict(orient="records")

    # Yearly sales
    if "year" in df.columns:
        yearly = df.groupby("year")["sales"].sum().reset_index()
        charts["yearly_sales"] = yearly.to_dict(orient="records")

    # Day of week
    if "day_of_week" in df.columns:
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        dow = df.groupby("day_of_week")["sales"].mean().reset_index()
        dow["day"] = dow["day_of_week"].apply(lambda x: day_names[x])
        charts["weekday_sales"] = dow[["day", "sales"]].to_dict(orient="records")

    # Category
    if "category" in df.columns:
        cat = df.groupby("category")["sales"].sum().reset_index().sort_values("sales", ascending=False)
        charts["category_sales"] = cat.to_dict(orient="records")

    # Region
    if "region" in df.columns:
        reg = df.groupby("region")["sales"].sum().reset_index().sort_values("sales", ascending=False)
        charts["region_sales"] = reg.to_dict(orient="records")

    # Product top 10 / bottom 10
    if "product" in df.columns:
        prod = df.groupby("product")["sales"].sum().reset_index().sort_values("sales", ascending=False)
        charts["top_products"] = prod.head(10).to_dict(orient="records")
        charts["bottom_products"] = prod.tail(10).to_dict(orient="records")

    # Sales histogram (bucketed)
    hist_counts, hist_bins = np.histogram(df["sales"].dropna(), bins=20)
    charts["sales_histogram"] = [
        {"bin": f"{hist_bins[i]:.0f}-{hist_bins[i+1]:.0f}", "count": int(hist_counts[i])}
        for i in range(len(hist_counts))
    ]

    # Season
    if "season" in df.columns:
        season = df.groupby("season")["sales"].sum().reset_index()
        charts["season_sales"] = season.to_dict(orient="records")

    # Quarterly
    if "quarter" in df.columns:
        qtr = df.groupby("quarter")["sales"].sum().reset_index()
        qtr["label"] = "Q" + qtr["quarter"].astype(str)
        charts["quarterly_sales"] = qtr[["label", "sales"]].to_dict(orient="records")

    # Discount vs Sales scatter (sampled)
    if "discount" in df.columns:
        sample = df[["discount", "sales"]].dropna().sample(min(300, len(df)), random_state=42)
        charts["discount_vs_sales"] = sample.to_dict(orient="records")

    # Weekend vs weekday
    if "is_weekend" in df.columns:
        wknd = df.groupby("is_weekend")["sales"].mean().reset_index()
        wknd["label"] = wknd["is_weekend"].map({0: "Weekday", 1: "Weekend"})
        charts["weekend_vs_weekday"] = wknd[["label", "sales"]].to_dict(orient="records")

    # Correlation matrix (numeric cols)
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    if len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr().round(3)
        charts["correlation"] = {
            "columns": numeric_cols,
            "matrix": corr.values.tolist(),
        }

    return charts


@router.post("/analyze/{session_id}")
async def analyze(session_id: str):
    session = get_session(session_id)
    if session is None:
        raise HTTPException(404, "Session not found. Please upload a dataset first.")

    raw_df = session.get("raw_df")
    if raw_df is None:
        raise HTTPException(400, "No dataset in session.")

    # 1. Clean
    clean_result = clean(raw_df)
    cleaned_df = clean_result["cleaned_df"]
    set_session(session_id, "cleaned_df", cleaned_df)
    set_session(session_id, "cleaning_report", clean_result["report"])

    # 2. Feature engineering
    fe_result = engineer_features(cleaned_df)
    featured_df = fe_result["featured_df"]
    set_session(session_id, "featured_df", featured_df)

    # 3. EDA charts
    eda_charts = _compute_eda_charts(featured_df)

    # 4. KPIs
    kpis = _compute_kpis(featured_df, fe_result)

    # 5. ML Training
    ml_result = train_models(featured_df)
    best_model = ml_result["best_model"]
    feature_names = ml_result["feature_names"]
    set_session(session_id, "best_model", best_model)
    set_session(session_id, "feature_names", feature_names)
    set_session(session_id, "ml_results", ml_result["results"])

    ml_summary = {
        "results": ml_result["results"],
        "best_model_name": ml_result["best_model_name"],
        "best_r2": ml_result["best_r2"],
        "feature_importance": ml_result["feature_importance"],
    }

    # 6. Forecast (30 days default)
    fc_result = run_forecast(featured_df, best_model, feature_names, horizon_days=30)
    set_session(session_id, "last_forecast", fc_result)

    # 7. Insights
    insights_result = generate_insights(featured_df, fe_result["summaries"])
    set_session(session_id, "insights", insights_result)

    # Preview data for session
    preview = session.get("validation", {})
    preview_info = {
        "rows": len(cleaned_df),
        "columns": len(cleaned_df.columns),
        "memory_usage": f"{cleaned_df.memory_usage(deep=True).sum() / 1024:.1f} KB",
        "date_range": eda_charts.get("daily_trend", [{}])[0].get("date", "N/A") + " to " +
                      (eda_charts.get("daily_trend") or [{}])[-1].get("date", "N/A")
                      if eda_charts.get("daily_trend") else "N/A",
        "column_names": list(cleaned_df.columns),
        "dtypes": {k: str(v) for k, v in cleaned_df.dtypes.items()},
    }

    # Store full analysis
    full_analysis = {
        "preview": preview_info,
        "kpis": kpis,
        "cleaning": clean_result["report"],
        "feature_columns": fe_result["new_columns"],
        "summaries": fe_result["summaries"],
        "charts": eda_charts,
        "ml": ml_summary,
        "forecast": fc_result,
        "insights": insights_result,
    }
    set_session(session_id, "full_analysis", full_analysis)

    return full_analysis
