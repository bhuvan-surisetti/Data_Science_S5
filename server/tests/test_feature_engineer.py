import unittest
import pandas as pd
from preprocessing.feature_engineer import engineer_features

class TestFeatureEngineer(unittest.TestCase):
    def test_engineer_features_temporal(self):
        # We pass a dataframe with dates and sales
        df = pd.DataFrame({
            "date": pd.to_datetime(["2023-01-01", "2023-06-15", "2023-12-25"]), # Sunday, Thursday, Monday
            "sales": [100.0, 150.0, 200.0]
        })
        result = engineer_features(df)
        featured_df = result["featured_df"]
        
        # Verify columns exist
        self.assertIn("year", featured_df.columns)
        self.assertIn("month", featured_df.columns)
        self.assertIn("day", featured_df.columns)
        self.assertIn("is_weekend", featured_df.columns)
        self.assertIn("season", featured_df.columns)
        
        # Verify values
        self.assertEqual(list(featured_df["year"]), [2023, 2023, 2023])
        self.assertEqual(list(featured_df["month"]), [1, 6, 12])
        self.assertEqual(list(featured_df["is_weekend"]), [1, 0, 0]) # Sunday = 1, Thursday = 0, Monday = 0
        self.assertEqual(list(featured_df["season"]), ["Winter", "Summer", "Winter"])

    def test_engineer_features_summaries(self):
        # Verify grouping summaries are correctly populated
        df = pd.DataFrame({
            "date": pd.to_datetime(["2023-01-01", "2023-01-02", "2023-02-01", "2023-02-02"]),
            "sales": [100.0, 200.0, 150.0, 50.0],
            "region": ["North", "North", "South", "South"],
            "category": ["Office", "Office", "Furniture", "Furniture"],
            "product": ["Pen", "Paper", "Chair", "Desk"]
        })
        result = engineer_features(df)
        summaries = result["summaries"]
        
        # Check region summary
        region_sum = summaries["region"]
        self.assertEqual(len(region_sum), 2)
        north_stat = next(r for r in region_sum if r["region"] == "North")
        self.assertEqual(north_stat["total_sales"], 300.0)
        self.assertEqual(north_stat["avg_sales"], 150.0)
        self.assertEqual(north_stat["order_count"], 2)
        self.assertEqual(north_stat["revenue_share_pct"], 60.0) # 300 / 500 * 100

        # Check category summary
        category_sum = summaries["category"]
        self.assertEqual(len(category_sum), 2)
        office_stat = next(c for c in category_sum if c["category"] == "Office")
        self.assertEqual(office_stat["total_sales"], 300.0)

        # Check top/bottom products
        self.assertIn("top_products", summaries)
        self.assertIn("bottom_products", summaries)
        self.assertEqual(summaries["top_products"][0]["product"], "Paper") # Sales: 200.0
        self.assertEqual(summaries["bottom_products"][-1]["product"], "Desk") # Sales: 50.0

        # Check monthly trend
        self.assertIn("monthly_trend", summaries)
        monthly_trend = summaries["monthly_trend"]
        self.assertEqual(len(monthly_trend), 2) # Jan and Feb
        self.assertEqual(monthly_trend[0]["label"], "2023-01")
        self.assertEqual(monthly_trend[0]["sales"], 300.0)

if __name__ == "__main__":
    unittest.main()
