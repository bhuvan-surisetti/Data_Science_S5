import unittest
import pandas as pd
from preprocessing.validator import validate

class TestValidator(unittest.TestCase):
    def test_validate_missing_required_columns(self):
        # Missing required columns should make validation fail
        df1 = pd.DataFrame({"sales": [100.0]})
        res1 = validate(df1)
        self.assertFalse(res1["valid"])
        self.assertTrue(any("Missing required column: 'Date'" in err for err in res1["errors"]))

        df2 = pd.DataFrame({"date": ["2023-01-01"]})
        res2 = validate(df2)
        self.assertFalse(res2["valid"])
        self.assertTrue(any("Missing required column: 'Sales'" in err for err in res2["errors"]))

    def test_validate_empty_dataset(self):
        # Empty DataFrame should fail validation
        df = pd.DataFrame(columns=["date", "sales"])
        res = validate(df)
        self.assertFalse(res["valid"])
        self.assertTrue(any("empty" in err.lower() for err in res["errors"]))

    def test_validate_invalid_date_column(self):
        # If all dates are unparseable, validation fails
        df = pd.DataFrame({
            "date": ["invalid", "nonsense"],
            "sales": [100, 200]
        })
        res = validate(df)
        self.assertFalse(res["valid"])
        self.assertTrue(any("no valid dates" in err for err in res["errors"]))

        # If some dates are unparseable, it's a warning, not an error
        df_warn = pd.DataFrame({
            "date": ["2023-01-01", "invalid"],
            "sales": [100, 200]
        })
        res_warn = validate(df_warn)
        self.assertTrue(res_warn["valid"])
        self.assertTrue(any("invalid/unparseable dates" in warn for warn in res_warn["warnings"]))

    def test_validate_sales_column(self):
        # If all sales are non-numeric, validation fails
        df = pd.DataFrame({
            "date": ["2023-01-01", "2023-01-02"],
            "sales": ["abc", "def"]
        })
        res = validate(df)
        self.assertFalse(res["valid"])
        self.assertTrue(any("no numeric values" in err for err in res["errors"]))

        # If some sales are non-numeric, it warns
        df_warn = pd.DataFrame({
            "date": ["2023-01-01", "2023-01-02"],
            "sales": [100.0, "abc"]
        })
        res_warn = validate(df_warn)
        self.assertTrue(res_warn["valid"])
        self.assertTrue(any("non-numeric Sales values" in warn for warn in res_warn["warnings"]))

        # Negative sales warning
        df_neg = pd.DataFrame({
            "date": ["2023-01-01"],
            "sales": [-50.0]
        })
        res_neg = validate(df_neg)
        self.assertTrue(res_neg["valid"])
        self.assertTrue(any("negative Sales values" in warn for warn in res_neg["warnings"]))

    def test_validate_duplicates_and_optional_columns(self):
        # Detects duplicates and optional columns
        df = pd.DataFrame({
            "date": ["2023-01-01", "2023-01-01"],
            "sales": [100.0, 100.0],
            "product": ["A", "A"],
            "quantity": [2, 2]
        })
        res = validate(df)
        self.assertTrue(res["valid"])
        self.assertTrue(any("duplicate rows" in warn for warn in res["warnings"]))
        self.assertEqual(res["detected_columns"]["product"], "product")
        self.assertEqual(res["detected_columns"]["quantity"], "quantity")

    def test_validate_large_dataset_warning(self):
        # Triggers a warning if dataset has > 100,000 rows
        # Let's mock len(df) or build a dummy df with 100,001 rows
        # To avoid high memory/time, let's create a minimal DataFrame of that size
        # in pandas, we can repeat a row or create it quickly.
        # But wait! A DataFrame with 100,001 rows of simple data is very cheap.
        df = pd.DataFrame({
            "date": ["2023-01-01"] * 100001,
            "sales": [100.0] * 100001
        })
        res = validate(df)
        self.assertTrue(res["valid"])
        self.assertTrue(any("Large dataset" in warn for warn in res["warnings"]))

if __name__ == "__main__":
    unittest.main()
