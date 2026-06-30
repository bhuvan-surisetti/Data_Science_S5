"""
Dataset Validator – validates uploaded sales datasets.
"""
import pandas as pd
from typing import Dict, Any, List


REQUIRED_COLUMNS = {"date", "sales"}
OPTIONAL_COLUMNS = {"product", "category", "region", "quantity", "discount", "unit price"}


def _normalise_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Lowercase + strip column names."""
    df.columns = [c.strip().lower() for c in df.columns]
    return df


def validate(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Returns a dict with:
      - valid: bool
      - errors: list of error strings
      - warnings: list of warning strings
      - detected_columns: dict mapping role -> actual column name
    """
    errors: List[str] = []
    warnings: List[str] = []
    df = _normalise_columns(df)

    col_set = set(df.columns)
    detected: Dict[str, str] = {}

    # --- Required columns ---
    for req in REQUIRED_COLUMNS:
        if req in col_set:
            detected[req] = req
        else:
            errors.append(f"Missing required column: '{req.title()}'. The dataset must contain a 'Date' and a 'Sales' column.")

    if errors:
        return {"valid": False, "errors": errors, "warnings": warnings, "detected_columns": detected}

    # --- Empty dataset ---
    if len(df) == 0:
        errors.append("Dataset is empty (0 rows).")
        return {"valid": False, "errors": errors, "warnings": warnings, "detected_columns": detected}

    # --- Date column validation ---
    try:
        parsed_dates = pd.to_datetime(df["date"], errors="coerce")
        null_dates = parsed_dates.isna().sum()
        if null_dates == len(df):
            errors.append("The 'Date' column contains no valid dates. Ensure dates are in a standard format (e.g., YYYY-MM-DD).")
        elif null_dates > 0:
            warnings.append(f"{null_dates} rows have invalid/unparseable dates and will be dropped during cleaning.")
    except Exception as e:
        errors.append(f"Date column validation failed: {str(e)}")

    # --- Sales column validation ---
    sales_numeric = pd.to_numeric(df["sales"], errors="coerce")
    non_numeric = sales_numeric.isna().sum()
    if non_numeric == len(df):
        errors.append("The 'Sales' column contains no numeric values.")
    elif non_numeric > 0:
        warnings.append(f"{non_numeric} rows have non-numeric Sales values and will be handled during cleaning.")

    negative_sales = (sales_numeric < 0).sum()
    if negative_sales > 0:
        warnings.append(f"{negative_sales} rows have negative Sales values. These will be flagged during cleaning.")

    # --- Duplicate rows ---
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        warnings.append(f"{dup_count} duplicate rows detected. They will be removed during cleaning.")

    # --- Optional columns ---
    for opt in OPTIONAL_COLUMNS:
        if opt in col_set:
            detected[opt] = opt

    # --- Size warnings ---
    if len(df) > 100_000:
        warnings.append(f"Large dataset ({len(df):,} rows). Processing may take longer than usual.")

    if errors:
        return {"valid": False, "errors": errors, "warnings": warnings, "detected_columns": detected}

    return {"valid": True, "errors": [], "warnings": warnings, "detected_columns": detected}
