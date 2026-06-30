import unittest
import pandas as pd
import numpy as np
from forecasting.forecaster import forecast

class MockModel:
    def predict(self, X):
        # Always predict constant value of 150.0
        return np.ones(len(X)) * 150.0

class TestForecaster(unittest.TestCase):
    def test_forecast_basic(self):
        # Create minimal training/historical dataframe
        df = pd.DataFrame({
            "date": pd.date_range("2023-01-01", periods=10),
            "sales": [100.0] * 10,
            "season": ["Winter"] * 10
        })
        
        feature_names = ["month", "year", "day", "quarter", "week_number", "day_of_week", "is_weekend"]
        model = MockModel()
        
        result = forecast(df, model, feature_names, horizon_days=5)
        
        # Verify result keys
        self.assertIn("forecast_table", result)
        self.assertIn("total_forecast", result)
        self.assertIn("avg_daily_forecast", result)
        self.assertIn("historical", result)
        
        # Verify shape & contents
        forecast_table = result["forecast_table"]
        self.assertEqual(len(forecast_table), 5)
        
        # Expected forecast is 150.0 * 5 = 750.0
        self.assertEqual(result["total_forecast"], 750.0)
        self.assertEqual(result["avg_daily_forecast"], 150.0)
        
        # Dates should start at 2023-01-11
        self.assertEqual(forecast_table[0]["date"], "2023-01-11")
        self.assertEqual(forecast_table[0]["forecast"], 150.0)

    def test_forecast_empty_or_none(self):
        df = pd.DataFrame()
        model = MockModel()
        
        res1 = forecast(df, model, ["month"])
        self.assertIn("error", res1)
        
        res2 = forecast(pd.DataFrame({"date": [pd.Timestamp("2023-01-01")]}), None, ["month"])
        self.assertIn("error", res2)

    def test_forecast_with_encoded_columns(self):
        # Create training/historical dataframe with category, region, product, season
        df = pd.DataFrame({
            "date": pd.date_range("2023-01-01", periods=10),
            "sales": [100.0] * 10,
            "category": ["Office"] * 10,
            "region": ["North"] * 10,
            "product": ["Pen"] * 10,
            "season": ["Winter"] * 10
        })
        
        feature_names = ["month", "year", "category_enc", "region_enc", "product_enc", "season_enc"]
        model = MockModel()
        
        result = forecast(df, model, feature_names, horizon_days=5)
        self.assertEqual(result["total_forecast"], 750.0)

if __name__ == "__main__":
    unittest.main()
