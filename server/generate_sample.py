"""
Generates a synthetic retail sales dataset for demonstration purposes.
"""
import csv
import random
from datetime import date, timedelta

random.seed(42)

products = {
    "Electronics": ["Laptop", "Smartphone", "Tablet", "Headphones", "Smart Watch", "Camera"],
    "Clothing": ["T-Shirt", "Jeans", "Jacket", "Dress", "Sneakers", "Hoodie"],
    "Home & Kitchen": ["Coffee Maker", "Blender", "Air Fryer", "Vacuum", "Lamp", "Pillow"],
    "Books": ["Fiction Novel", "Science Book", "Cookbook", "Textbook", "Biography", "Comics"],
    "Sports": ["Yoga Mat", "Dumbbells", "Tennis Racket", "Running Shoes", "Bicycle", "Protein Powder"],
}

regions = ["North", "South", "East", "West", "Central"]

# Seasonal multipliers (month index 1-12)
SEASON_MULT = {1:0.7,2:0.75,3:0.9,4:0.95,5:1.0,6:1.05,7:1.1,8:1.0,9:0.95,10:1.1,11:1.3,12:1.5}

rows = []
start_date = date(2022, 1, 1)
end_date = date(2024, 12, 31)
current = start_date

while current <= end_date:
    num_orders = random.randint(3, 12)
    month_mult = SEASON_MULT[current.month]
    weekend_mult = 1.2 if current.weekday() >= 5 else 1.0

    for _ in range(num_orders):
        category = random.choice(list(products.keys()))
        product = random.choice(products[category])
        region = random.choice(regions)
        quantity = random.randint(1, 10)

        # Base price by category
        base_prices = {"Electronics": 450, "Clothing": 60, "Home & Kitchen": 80, "Books": 25, "Sports": 55}
        unit_price = round(base_prices[category] * random.uniform(0.6, 1.8), 2)

        discount = round(random.choice([0, 0, 0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]), 2)
        sales = round(unit_price * quantity * (1 - discount) * month_mult * weekend_mult * random.uniform(0.85, 1.15), 2)

        rows.append({
            "Date": current.strftime("%Y-%m-%d"),
            "Sales": max(1.0, sales),
            "Product": product,
            "Category": category,
            "Region": region,
            "Quantity": quantity,
            "Discount": discount,
            "Unit Price": unit_price,
        })

    current += timedelta(days=1)

# Write CSV
import os
output_path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_sales.csv")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["Date","Sales","Product","Category","Region","Quantity","Discount","Unit Price"])
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} rows -> {output_path}")
