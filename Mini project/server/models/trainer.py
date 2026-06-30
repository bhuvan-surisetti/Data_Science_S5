"""
ML Trainer – trains multiple regression models and returns comparison metrics.
"""
import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder


def _prepare_features(df: pd.DataFrame):
    """Extract numeric features from featured DataFrame."""
    feature_cols = ["month", "year", "day", "quarter", "week_number", "day_of_week", "is_weekend"]
    available = [c for c in feature_cols if c in df.columns]

    X = df[available].copy()

    # Add encoded categoricals
    for col in ["category", "region", "product", "season"]:
        if col in df.columns:
            le = LabelEncoder()
            X[f"{col}_enc"] = le.fit_transform(df[col].astype(str))

    y = df["sales"].values
    return X, y, available


def train_models(df: pd.DataFrame) -> Dict[str, Any]:
    X, y, feature_names = _prepare_features(df)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(random_state=42, max_depth=10),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=42),
        "Extra Trees": ExtraTreesRegressor(n_estimators=100, random_state=42, n_jobs=-1),
    }

    # Try XGBoost
    try:
        import xgboost as xgb
        models["XGBoost"] = xgb.XGBRegressor(n_estimators=100, random_state=42, verbosity=0)
    except ImportError:
        pass

    results: List[Dict[str, Any]] = []
    best_model = None
    best_r2 = float("-inf")
    best_model_name = ""

    for name, model in models.items():
        try:
            t0 = time.time()
            model.fit(X_train, y_train)
            train_time = round(time.time() - t0, 4)

            t1 = time.time()
            y_pred = model.predict(X_test)
            pred_time = round(time.time() - t1, 4)

            mae = round(float(mean_absolute_error(y_test, y_pred)), 4)
            mse = round(float(mean_squared_error(y_test, y_pred)), 4)
            rmse = round(float(np.sqrt(mse)), 4)
            r2 = round(float(r2_score(y_test, y_pred)), 4)

            results.append({
                "model": name,
                "mae": mae,
                "mse": mse,
                "rmse": rmse,
                "r2": r2,
                "training_time_s": train_time,
                "prediction_time_s": pred_time,
            })

            if r2 > best_r2:
                best_r2 = r2
                best_model = model
                best_model_name = name
        except Exception as e:
            results.append({"model": name, "error": str(e)})

    # Feature importance (if available)
    feature_importance = []
    if best_model and hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
        cols = list(X.columns)
        fi = sorted(zip(cols, importances), key=lambda x: x[1], reverse=True)
        feature_importance = [{"feature": f, "importance": round(float(i), 4)} for f, i in fi]

    return {
        "results": results,
        "best_model": best_model,
        "best_model_name": best_model_name,
        "best_r2": best_r2,
        "feature_importance": feature_importance,
        "feature_names": list(X.columns),
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
    }
