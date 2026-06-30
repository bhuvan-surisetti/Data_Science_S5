import unittest
import pandas as pd
import numpy as np
from preprocessing.cleaner import clean

class TestCleaner(unittest.TestCase):
    def test_clean_column_normalisation(self):
        # Columns should be trimmed and lowercased
        df = pd.DataFrame({
            "  Date  ": ["2023-01-01"],
            "SALES": [100.0]
        })
        result = clean(df)
        cleaned_df = result["cleaned_df"]
        self.assertIn("date", cleaned_df.columns)
        self.assertIn("sales", cleaned_df.columns)
        self.assertNotIn("  Date  ", cleaned_df.columns)
        self.assertNotIn("SALES", cleaned_df.columns)

    def test_clean_duplicate_removal(self):
        # Exact duplicate rows should be removed
        df = pd.DataFrame({
            "date": ["2023-01-01", "2023-01-01", "2023-01-02"],
            "sales": [100.0, 100.0, 150.0]
        })
        result = clean(df)
        cleaned_df = result["cleaned_df"]
        self.assertEqual(len(cleaned_df), 2)
        self.assertIn("Removed 1 duplicate rows.", result["report"]["actions"])

    def test_clean_unparseable_dates(self):
        # Rows with unparseable dates should be dropped
        df = pd.DataFrame({
            "date": ["2023-01-01", "invalid-date", "2023-01-02"],
            "sales": [100.0, 200.0, 150.0]
        })
        result = clean(df)
        cleaned_df = result["cleaned_df"]
        self.assertEqual(len(cleaned_df), 2)
        # Dates should be sorted and index reset
        self.assertEqual(list(cleaned_df["date"]), [pd.Timestamp("2023-01-01"), pd.Timestamp("2023-01-02")])
        self.assertTrue(any("Dropped 1 rows" in action for action in result["report"]["actions"]))

    def test_clean_sales_missing_and_negatives(self):
        # Missing sales should be imputed with median, and negative sales absolute-valued
        df = pd.DataFrame({
            "date": ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04"],
            "sales": [10.0, None, -30.0, 50.0]
        })
        # Median of [10.0, -30.0, 50.0] is 10.0
        # If we fillna with median first, then convert negative, or vice-versa?
        # Let's check cleaner.py:
        # line 44: df["sales"] = pd.to_numeric(df["sales"], errors="coerce")
        # line 47: df["sales"] = df["sales"].fillna(df["sales"].median())
        # line 52: df.loc[df["sales"] < 0, "sales"] = df["sales"].abs()
        # So for: 10.0, NaN, -30.0, 50.0
        # Median is of [10, -30, 50] which is 10.0.
        # So NaN is filled with 10.0.
        # Then -30.0 becomes 30.0.
        # Let's verify this behavior
        result = clean(df)
        cleaned_df = result["cleaned_df"]
        self.assertEqual(cleaned_df.loc[1, "sales"], 10.0) # Imputed NaN
        self.assertEqual(cleaned_df.loc[2, "sales"], 30.0) # Negative to absolute

    def test_clean_quantity_and_discount(self):
        # Quantity should be filled, clipped to >= 0. Discount filled, clipped to 0-1.
        df = pd.DataFrame({
            "date": ["2023-01-01", "2023-01-02", "2023-01-03"],
            "sales": [100.0, 100.0, 100.0],
            "quantity": [5, None, -2],
            "discount": [0.1, None, 1.5]
        })
        result = clean(df)
        cleaned_df = result["cleaned_df"]
        # Median quantity of [5, -2] is 1.5
        self.assertEqual(cleaned_df.loc[1, "quantity"], 1.5)
        self.assertEqual(cleaned_df.loc[2, "quantity"], 0) # Clipped lower=0
        self.assertEqual(cleaned_df.loc[1, "discount"], 0.0) # Missing filled with 0
        self.assertEqual(cleaned_df.loc[2, "discount"], 1.0) # Clipped upper=1

    def test_clean_categoricals(self):
        # Product, category, region should be title-cased, trimmed, and special values mapped to Unknown
        df = pd.DataFrame({
            "date": ["2023-01-01", "2023-01-02", "2023-01-03"],
            "sales": [100.0, 100.0, 100.0],
            "product": ["  ipad  ", "None", ""],
            "category": ["electronics", "Nan", ""]
        })
        result = clean(df)
        cleaned_df = result["cleaned_df"]
        self.assertEqual(cleaned_df.loc[0, "product"], "Ipad")
        self.assertEqual(cleaned_df.loc[1, "product"], "Unknown")
        self.assertEqual(cleaned_df.loc[2, "product"], "Unknown")
        self.assertEqual(cleaned_df.loc[0, "category"], "Electronics")
        self.assertEqual(cleaned_df.loc[1, "category"], "Unknown")
        self.assertEqual(cleaned_df.loc[2, "category"], "Unknown")

    def test_clean_outliers_iqr(self):
        # Outliers should be capped using 3xIQR rule
        # Standard values: 10, 12, 11, 13, 10, 12
        # Q1 = 10.25, Q3 = 12.0, IQR = 1.75. Lower = 5.0, Upper = 17.25
        # One high outlier: 100
        sales = [10.0, 12.0, 11.0, 13.0, 10.0, 12.0, 100.0]
        df = pd.DataFrame({
            "date": pd.date_range("2023-01-01", periods=7),
            "sales": sales
        })
        result = clean(df)
        cleaned_df = result["cleaned_df"]
        # Max sales should be capped below 100
        self.assertLess(cleaned_df["sales"].max(), 100.0)
        self.assertTrue(any("Capped" in action and "outliers" in action for action in result["report"]["actions"]))

if __name__ == "__main__":
    unittest.main()
