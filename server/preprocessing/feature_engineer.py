"""
Feature Engineering – generates temporal and categorical features from cleaned data.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any


SEASON_MAP = {
    12: "Winter", 1: "Winter", 2: "Winter",
    3: "Spring", 4: "Spring", 5: "Spring",
    6: "Summer", 7: "Summer", 8: "Summer",
    9: "Autumn", 10: "Autumn", 11: "Autumn",
}

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def engineer_features(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Returns {featured_df, new_columns: list, summaries: dict}
    """
    df = df.copy()
    new_cols = []

    # --- Temporal features from Date ---
    if "date" in df.columns:
        df["year"] = df["date"].dt.year
        df["month"] = df["date"].dt.month
        df["day"] = df["date"].dt.day
        df["quarter"] = df["date"].dt.quarter
        df["week_number"] = df["date"].dt.isocalendar().week.astype(int)
        df["day_of_week"] = df["date"].dt.dayofweek  # 0=Monday
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
        df["month_name"] = df["month"].apply(lambda m: MONTH_NAMES[m - 1])
        df["day_name"] = df["day_of_week"].apply(lambda d: DAY_NAMES[d])
        df["season"] = df["month"].map(SEASON_MAP)
        new_cols += ["year", "month", "day", "quarter", "week_number",
                     "day_of_week", "is_weekend", "month_name", "day_name", "season"]

    # --- Regional summaries ---
    summaries = {}
    if "region" in df.columns:
        region_sales = df.groupby("region")["sales"].agg(["sum", "mean", "count"]).reset_index()
        region_sales.columns = ["region", "total_sales", "avg_sales", "order_count"]
        region_sales["revenue_share_pct"] = (region_sales["total_sales"] / region_sales["total_sales"].sum() * 100).round(2)
        summaries["region"] = region_sales.to_dict(orient="records")

    if "category" in df.columns:
        cat_sales = df.groupby("category")["sales"].agg(["sum", "mean", "count"]).reset_index()
        cat_sales.columns = ["category", "total_sales", "avg_sales", "order_count"]
        cat_sales["revenue_share_pct"] = (cat_sales["total_sales"] / cat_sales["total_sales"].sum() * 100).round(2)
        summaries["category"] = cat_sales.to_dict(orient="records")

    if "product" in df.columns:
        prod_sales = df.groupby("product")["sales"].sum().reset_index()
        prod_sales.columns = ["product", "total_sales"]
        prod_sales = prod_sales.sort_values("total_sales", ascending=False)
        summaries["top_products"] = prod_sales.head(10).to_dict(orient="records")
        summaries["bottom_products"] = prod_sales.tail(10).to_dict(orient="records")

    # --- Monthly trend ---
    if "year" in df.columns and "month" in df.columns:
        monthly = df.groupby(["year", "month"])["sales"].sum().reset_index()
        monthly["label"] = monthly["year"].astype(str) + "-" + monthly["month"].astype(str).str.zfill(2)
        summaries["monthly_trend"] = monthly[["label", "sales"]].to_dict(orient="records")

    # --- Seasonal trend ---
    if "season" in df.columns:
        seasonal = df.groupby("season")["sales"].sum().reset_index()
        summaries["seasonal"] = seasonal.to_dict(orient="records")

    # --- Weekend vs weekday ---
    if "is_weekend" in df.columns:
        wknd = df.groupby("is_weekend")["sales"].mean().reset_index()
        wknd["label"] = wknd["is_weekend"].map({0: "Weekday", 1: "Weekend"})
        summaries["weekend_vs_weekday"] = wknd[["label", "sales"]].to_dict(orient="records")

    return {
        "featured_df": df,
        "new_columns": new_cols,
        "summaries": summaries,
    }
