"""
Data Cleaner – removes duplicates, handles missing values, parses dates, handles outliers.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any


def clean(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Returns {cleaned_df, report: {before, after, actions}}
    """
    df = df.copy()
    df.columns = [c.strip().lower() for c in df.columns]

    report = {
        "before": {
            "rows": len(df),
            "missing_values": int(df.isna().sum().sum()),
            "duplicates": int(df.duplicated().sum()),
            "columns": list(df.columns),
        },
        "actions": [],
    }

    # 1. Remove exact duplicates
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        df = df.drop_duplicates()
        report["actions"].append(f"Removed {dup_count} duplicate rows.")

    # 2. Parse Date
    if "date" in df.columns:
        before_date = len(df)
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df = df.dropna(subset=["date"])
        dropped = before_date - len(df)
        if dropped > 0:
            report["actions"].append(f"Dropped {dropped} rows with unparseable dates.")
        df = df.sort_values("date").reset_index(drop=True)

    # 3. Convert Sales to numeric
    if "sales" in df.columns:
        df["sales"] = pd.to_numeric(df["sales"], errors="coerce")
        null_sales = df["sales"].isna().sum()
        if null_sales > 0:
            df["sales"] = df["sales"].fillna(df["sales"].median())
            report["actions"].append(f"Imputed {null_sales} missing Sales values with median.")
        # Handle negative sales
        neg_sales = (df["sales"] < 0).sum()
        if neg_sales > 0:
            df.loc[df["sales"] < 0, "sales"] = df["sales"].abs()
            report["actions"].append(f"Converted {neg_sales} negative Sales values to absolute values.")

    # 4. Handle Quantity
    if "quantity" in df.columns:
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")
        df["quantity"] = df["quantity"].fillna(df["quantity"].median())
        df["quantity"] = df["quantity"].clip(lower=0)

    # 5. Handle Discount
    if "discount" in df.columns:
        df["discount"] = pd.to_numeric(df["discount"], errors="coerce")
        df["discount"] = df["discount"].fillna(0)
        df["discount"] = df["discount"].clip(lower=0, upper=1)

    # 6. Handle Unit Price
    if "unit price" in df.columns:
        df["unit price"] = pd.to_numeric(df["unit price"], errors="coerce")
        df["unit price"] = df["unit price"].fillna(df["unit price"].median())

    # 7. Strip & title-case categorical string columns
    for col in ["product", "category", "region"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.title()
            df[col] = df[col].replace({"Nan": "Unknown", "None": "Unknown", "": "Unknown"})

    # 8. Fill remaining missing values
    for col in df.select_dtypes(include="number").columns:
        null_count = df[col].isna().sum()
        if null_count > 0:
            df[col] = df[col].fillna(df[col].median())
            report["actions"].append(f"Imputed {null_count} missing values in '{col}' with median.")

    for col in df.select_dtypes(include="object").columns:
        null_count = df[col].isna().sum()
        if null_count > 0:
            df[col] = df[col].fillna("Unknown")
            report["actions"].append(f"Filled {null_count} missing values in '{col}' with 'Unknown'.")

    # 9. Outlier handling for Sales (IQR capping)
    if "sales" in df.columns:
        Q1 = df["sales"].quantile(0.25)
        Q3 = df["sales"].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 3 * IQR
        upper_bound = Q3 + 3 * IQR
        outliers = ((df["sales"] < lower_bound) | (df["sales"] > upper_bound)).sum()
        if outliers > 0:
            df["sales"] = df["sales"].clip(lower=lower_bound, upper=upper_bound)
            report["actions"].append(f"Capped {outliers} Sales outliers using 3×IQR rule.")

    if not report["actions"]:
        report["actions"].append("Dataset was already clean – no changes were required.")

    report["after"] = {
        "rows": len(df),
        "missing_values": int(df.isna().sum().sum()),
        "duplicates": int(df.duplicated().sum()),
        "rows_removed": report["before"]["rows"] - len(df),
    }

    return {"cleaned_df": df, "report": report}
