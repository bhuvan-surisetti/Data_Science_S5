"""
Business Insights Generator – rule-based pattern detection from data statistics.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List


def generate_insights(df: pd.DataFrame, summaries: Dict[str, Any]) -> Dict[str, Any]:
    insights: List[Dict[str, Any]] = []
    recommendations: List[str] = []

    total_sales = df["sales"].sum()

    # --- Seasonality / Month peaks ---
    if "month" in df.columns:
        monthly = df.groupby("month")["sales"].sum()
        peak_month_num = int(monthly.idxmax())
        low_month_num = int(monthly.idxmin())
        month_names = ["January","February","March","April","May","June",
                       "July","August","September","October","November","December"]
        peak_month = month_names[peak_month_num - 1]
        low_month = month_names[low_month_num - 1]
        peak_val = float(monthly.max())
        low_val = float(monthly.min())

        insights.append({
            "id": "seasonal_peak",
            "type": "trend",
            "severity": "high",
            "icon": "TrendingUp",
            "title": f"Sales Peak in {peak_month}",
            "text": f"Sales are highest in {peak_month} (${peak_val:,.0f}), which is {peak_val/total_sales*100:.1f}% of annual revenue.",
        })
        recommendations.append(f"Increase inventory and run promotional campaigns ahead of {peak_month} to capitalize on peak demand.")

        insights.append({
            "id": "seasonal_low",
            "type": "warning",
            "severity": "medium",
            "icon": "TrendingDown",
            "title": f"Low Sales in {low_month}",
            "text": f"{low_month} records the lowest sales (${low_val:,.0f}). Consider targeted promotions to boost revenue during this period.",
        })
        recommendations.append(f"Launch discount campaigns or bundle offers in {low_month} to counter the seasonal dip.")

    # --- Weekend vs Weekday ---
    if "is_weekend" in df.columns:
        wkday_avg = df[df["is_weekend"] == 0]["sales"].mean()
        wkend_avg = df[df["is_weekend"] == 1]["sales"].mean()
        if wkend_avg > wkday_avg * 1.05:
            diff_pct = (wkend_avg - wkday_avg) / wkday_avg * 100
            insights.append({
                "id": "weekend_higher",
                "type": "info",
                "severity": "low",
                "icon": "Calendar",
                "title": "Weekend Sales Are Higher",
                "text": f"Weekend average sales (${wkend_avg:,.0f}) are {diff_pct:.1f}% higher than weekday sales (${wkday_avg:,.0f}).",
            })
            recommendations.append("Schedule marketing pushes on Thursdays to drive weekend purchase intent.")
        elif wkday_avg > wkend_avg * 1.05:
            diff_pct = (wkday_avg - wkend_avg) / wkend_avg * 100
            insights.append({
                "id": "weekday_higher",
                "type": "info",
                "severity": "low",
                "icon": "Briefcase",
                "title": "Weekday Sales Dominate",
                "text": f"Weekday average sales (${wkday_avg:,.0f}) are {diff_pct:.1f}% higher than weekends. Business-to-business pattern detected.",
            })

    # --- Top product concentration ---
    if "product" in df.columns:
        prod_sales = df.groupby("product")["sales"].sum().sort_values(ascending=False)
        if len(prod_sales) > 0:
            top_product = prod_sales.index[0]
            top_share = prod_sales.iloc[0] / total_sales * 100
            insights.append({
                "id": "top_product",
                "type": "success",
                "severity": "high",
                "icon": "Star",
                "title": f"Top Product: {top_product}",
                "text": f"'{top_product}' contributes {top_share:.1f}% of total revenue (${prod_sales.iloc[0]:,.0f}).",
            })
            if top_share > 40:
                insights.append({
                    "id": "product_concentration",
                    "type": "warning",
                    "severity": "high",
                    "icon": "AlertTriangle",
                    "title": "High Revenue Concentration Risk",
                    "text": f"Over 40% of revenue comes from a single product ('{top_product}'). This creates supply-chain risk.",
                })
                recommendations.append(f"Diversify product portfolio to reduce dependence on '{top_product}'.")

            if len(prod_sales) > 1:
                bottom_product = prod_sales.index[-1]
                bottom_share = prod_sales.iloc[-1] / total_sales * 100
                insights.append({
                    "id": "bottom_product",
                    "type": "warning",
                    "severity": "low",
                    "icon": "Package",
                    "title": f"Lowest Seller: {bottom_product}",
                    "text": f"'{bottom_product}' accounts for only {bottom_share:.2f}% of revenue. Consider discontinuing or repositioning.",
                })
                recommendations.append(f"Review the business case for '{bottom_product}'. Consider bundling it with top performers or running a clearance sale.")

    # --- Region concentration ---
    if "region" in df.columns:
        region_sales = df.groupby("region")["sales"].sum().sort_values(ascending=False)
        if len(region_sales) > 1:
            top_region = region_sales.index[0]
            bottom_region = region_sales.index[-1]
            bottom_share = region_sales.iloc[-1] / total_sales * 100
            insights.append({
                "id": "region_leader",
                "type": "success",
                "severity": "medium",
                "icon": "MapPin",
                "title": f"Top Region: {top_region}",
                "text": f"'{top_region}' leads all regions with {region_sales.iloc[0]/total_sales*100:.1f}% of total revenue.",
            })
            if bottom_share < 15:
                insights.append({
                    "id": "region_underperformer",
                    "type": "warning",
                    "severity": "medium",
                    "icon": "Map",
                    "title": f"Underperforming Region: {bottom_region}",
                    "text": f"'{bottom_region}' contributes only {bottom_share:.1f}% of total revenue. Significant growth opportunity exists.",
                })
                recommendations.append(f"Launch targeted marketing campaigns in '{bottom_region}' to capture untapped market potential.")

    # --- Discount analysis ---
    if "discount" in df.columns:
        avg_discount = df["discount"].mean() * 100
        high_discount_mask = df["discount"] > 0.2
        if high_discount_mask.sum() > 0:
            high_disc_sales = df[high_discount_mask]["sales"].mean()
            low_disc_sales = df[~high_discount_mask]["sales"].mean()
            insights.append({
                "id": "discount_impact",
                "type": "info",
                "severity": "medium",
                "icon": "Tag",
                "title": f"Average Discount: {avg_discount:.1f}%",
                "text": f"Orders with >20% discount have an average sale of ${high_disc_sales:,.0f} vs ${low_disc_sales:,.0f} for lower discounts.",
            })
            if high_disc_sales < low_disc_sales:
                recommendations.append("High discounts (>20%) are associated with lower average sales. Review your discount strategy to protect margins.")

    # --- Growth trend ---
    if "year" in df.columns:
        yearly = df.groupby("year")["sales"].sum()
        if len(yearly) > 1:
            years = sorted(yearly.index)
            last_year = yearly[years[-1]]
            prev_year = yearly[years[-2]]
            yoy_growth = (last_year - prev_year) / prev_year * 100
            trend = "grew" if yoy_growth > 0 else "declined"
            insights.append({
                "id": "yoy_growth",
                "type": "success" if yoy_growth > 0 else "warning",
                "severity": "high",
                "icon": "BarChart2",
                "title": f"Year-over-Year: {yoy_growth:+.1f}%",
                "text": f"Revenue {trend} by {abs(yoy_growth):.1f}% from {years[-2]} to {years[-1]}. From ${prev_year:,.0f} to ${last_year:,.0f}.",
            })
            if yoy_growth < 0:
                recommendations.append("Address the year-over-year revenue decline by analyzing product mix, pricing strategy, and market conditions.")

    # --- Category insights ---
    if "category" in df.columns:
        cat_sales = df.groupby("category")["sales"].sum().sort_values(ascending=False)
        if len(cat_sales) > 0:
            top_cat = cat_sales.index[0]
            insights.append({
                "id": "top_category",
                "type": "success",
                "severity": "medium",
                "icon": "Layers",
                "title": f"Best Category: {top_cat}",
                "text": f"'{top_cat}' is the highest-revenue category, contributing {cat_sales.iloc[0]/total_sales*100:.1f}% of total sales.",
            })
            recommendations.append(f"Focus product development and marketing investment on '{top_cat}' to amplify growth.")

    # --- General recommendation ---
    recommendations.append("Implement a monthly sales review cadence to track KPIs against forecasts and adjust strategy promptly.")
    recommendations.append("Use the forecast data to optimize inventory procurement cycles and reduce carrying costs.")

    return {
        "insights": insights,
        "recommendations": recommendations,
        "insight_count": len(insights),
        "recommendation_count": len(recommendations),
    }
