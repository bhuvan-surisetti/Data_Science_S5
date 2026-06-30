"""
PDF Report Generator using ReportLab.
"""
import io
import pandas as pd
from typing import Dict, Any, List
from datetime import datetime

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


BRAND_BLUE = colors.HexColor("#2563EB")
BRAND_DARK = colors.HexColor("#0F172A")
BRAND_GRAY = colors.HexColor("#64748B")
BRAND_LIGHT = colors.HexColor("#F8FAFC")
BRAND_GREEN = colors.HexColor("#10B981")
BRAND_RED = colors.HexColor("#EF4444")


def generate_pdf(analysis: Dict[str, Any], session_id: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()
    story = []

    # --- Custom Styles ---
    title_style = ParagraphStyle("Title", parent=styles["Title"],
                                  fontSize=28, textColor=BRAND_DARK, spaceAfter=4, alignment=TA_CENTER)
    subtitle_style = ParagraphStyle("Subtitle", parent=styles["Normal"],
                                     fontSize=13, textColor=BRAND_GRAY, spaceAfter=20, alignment=TA_CENTER)
    h1_style = ParagraphStyle("H1", parent=styles["Heading1"],
                               fontSize=18, textColor=BRAND_BLUE, spaceBefore=16, spaceAfter=8)
    h2_style = ParagraphStyle("H2", parent=styles["Heading2"],
                               fontSize=13, textColor=BRAND_DARK, spaceBefore=10, spaceAfter=6)
    body_style = ParagraphStyle("Body", parent=styles["Normal"],
                                 fontSize=10, textColor=BRAND_GRAY, spaceAfter=6, leading=14)
    kpi_val_style = ParagraphStyle("KpiVal", parent=styles["Normal"],
                                    fontSize=16, textColor=BRAND_DARK, alignment=TA_CENTER)
    kpi_lbl_style = ParagraphStyle("KpiLbl", parent=styles["Normal"],
                                    fontSize=9, textColor=BRAND_GRAY, alignment=TA_CENTER)

    # ===== COVER PAGE =====
    story.append(Spacer(1, 1.5 * inch))
    story.append(Paragraph("SalesVision AI", title_style))
    story.append(Paragraph("Intelligent Sales Forecasting & Analytics Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_BLUE))
    story.append(Spacer(1, 0.3 * inch))

    now = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    story.append(Paragraph(f"Generated: {now}", ParagraphStyle("small", parent=styles["Normal"],
                                                                  fontSize=10, textColor=BRAND_GRAY, alignment=TA_CENTER)))
    story.append(Paragraph(f"Session ID: {session_id[:8].upper()}...", ParagraphStyle("small2", parent=styles["Normal"],
                                                                                        fontSize=9, textColor=BRAND_GRAY, alignment=TA_CENTER)))
    story.append(PageBreak())

    # ===== DATASET SUMMARY =====
    story.append(Paragraph("1. Dataset Summary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    story.append(Spacer(1, 0.1 * inch))

    if "preview" in analysis:
        prev = analysis["preview"]
        summary_data = [
            ["Metric", "Value"],
            ["Total Rows", f"{prev.get('rows', 'N/A'):,}"],
            ["Total Columns", str(prev.get('columns', 'N/A'))],
            ["Memory Usage", prev.get('memory_usage', 'N/A')],
            ["Date Range", prev.get('date_range', 'N/A')],
        ]
        t = Table(summary_data, colWidths=[2.5 * inch, 4 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, 0), 11),
            ("BACKGROUND", (0, 1), (-1, -1), BRAND_LIGHT),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_LIGHT]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("FONTSIZE", (0, 1), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(t)

    story.append(Spacer(1, 0.3 * inch))

    # ===== KPIs =====
    story.append(Paragraph("2. Key Performance Indicators", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    story.append(Spacer(1, 0.1 * inch))

    if "kpis" in analysis:
        kpis = analysis["kpis"]
        kpi_items = [
            ("Total Revenue", f"${kpis.get('total_revenue', 0):,.2f}"),
            ("Avg Daily Sales", f"${kpis.get('avg_sales', 0):,.2f}"),
            ("Max Sale", f"${kpis.get('max_sale', 0):,.2f}"),
            ("Min Sale", f"${kpis.get('min_sale', 0):,.2f}"),
            ("Total Orders", f"{kpis.get('total_orders', 0):,}"),
            ("Growth %", f"{kpis.get('growth_pct', 0):+.1f}%"),
        ]
        kpi_data = [["KPI", "Value"]] + kpi_items
        t = Table(kpi_data, colWidths=[3 * inch, 3.5 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, 0), 11),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_LIGHT]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("FONTSIZE", (0, 1), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(t)

    story.append(Spacer(1, 0.3 * inch))
    story.append(PageBreak())

    # ===== CLEANING REPORT =====
    story.append(Paragraph("3. Data Cleaning Report", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    story.append(Spacer(1, 0.1 * inch))

    if "cleaning" in analysis:
        cleaning = analysis["cleaning"]
        before = cleaning.get("before", {})
        after = cleaning.get("after", {})

        clean_data = [
            ["Metric", "Before Cleaning", "After Cleaning"],
            ["Rows", f"{before.get('rows', 0):,}", f"{after.get('rows', 0):,}"],
            ["Missing Values", str(before.get('missing_values', 0)), str(after.get('missing_values', 0))],
            ["Duplicates", str(before.get('duplicates', 0)), str(after.get('duplicates', 0))],
            ["Rows Removed", "-", str(after.get('rows_removed', 0))],
        ]
        t = Table(clean_data, colWidths=[2.5 * inch, 2 * inch, 2 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_LIGHT]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.15 * inch))

        story.append(Paragraph("Actions Performed:", h2_style))
        for action in cleaning.get("actions", []):
            story.append(Paragraph(f"• {action}", body_style))

    story.append(PageBreak())

    # ===== ML MODEL COMPARISON =====
    story.append(Paragraph("4. Machine Learning Model Comparison", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    story.append(Spacer(1, 0.1 * inch))

    if "ml" in analysis and "results" in analysis["ml"]:
        ml_data = [["Model", "MAE", "RMSE", "R² Score", "Train Time"]]
        for r in analysis["ml"]["results"]:
            if "error" not in r:
                ml_data.append([
                    r.get("model", ""),
                    f"{r.get('mae', 0):,.2f}",
                    f"{r.get('rmse', 0):,.2f}",
                    f"{r.get('r2', 0):.4f}",
                    f"{r.get('training_time_s', 0):.3f}s",
                ])
        t = Table(ml_data, colWidths=[1.8*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.1*inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_LIGHT]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        story.append(t)
        best = analysis["ml"].get("best_model_name", "")
        if best:
            story.append(Spacer(1, 0.1 * inch))
            story.append(Paragraph(f"✓ Best Model: {best} (highest R² score)", ParagraphStyle(
                "best", parent=styles["Normal"], fontSize=11, textColor=BRAND_GREEN,
                spaceBefore=6, spaceAfter=6
            )))

    story.append(PageBreak())

    # ===== FORECAST =====
    story.append(Paragraph("5. Sales Forecast", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    story.append(Spacer(1, 0.1 * inch))

    if "forecast" in analysis:
        fc = analysis["forecast"]
        story.append(Paragraph(f"Forecast Horizon: Next {fc.get('horizon_days', '?')} Days", h2_style))
        story.append(Paragraph(f"Total Forecast Revenue: ${fc.get('total_forecast', 0):,.2f}", body_style))
        story.append(Paragraph(f"Avg Daily Forecast: ${fc.get('avg_daily_forecast', 0):,.2f}", body_style))
        story.append(Paragraph(f"Growth vs Recent 30 Days: {fc.get('growth_pct_vs_recent', 0):+.2f}%", body_style))
        story.append(Spacer(1, 0.1 * inch))

        fc_table = fc.get("forecast_table", [])[:15]
        if fc_table:
            fc_data = [["Date", "Forecast ($)", "Lower CI ($)", "Upper CI ($)"]]
            for row in fc_table:
                fc_data.append([
                    row["date"],
                    f"{row['forecast']:,.2f}",
                    f"{row['lower_ci']:,.2f}",
                    f"{row['upper_ci']:,.2f}",
                ])
            t = Table(fc_data, colWidths=[1.8*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BRAND_LIGHT]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]))
            story.append(t)
            if len(fc.get("forecast_table", [])) > 15:
                story.append(Paragraph(f"... and {len(fc['forecast_table']) - 15} more rows in the CSV download.", body_style))

    story.append(PageBreak())

    # ===== INSIGHTS =====
    story.append(Paragraph("6. AI Business Insights", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    story.append(Spacer(1, 0.1 * inch))

    if "insights" in analysis:
        ins_data = analysis["insights"]
        for ins in ins_data.get("insights", []):
            story.append(Paragraph(f"◆ {ins['title']}", h2_style))
            story.append(Paragraph(ins["text"], body_style))
            story.append(Spacer(1, 0.05 * inch))

        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph("Recommendations", h2_style))
        for i, rec in enumerate(ins_data.get("recommendations", []), 1):
            story.append(Paragraph(f"{i}. {rec}", body_style))

    # ===== FOOTER =====
    story.append(Spacer(1, 0.5 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0")))
    story.append(Paragraph("Generated by SalesVision AI · Confidential", ParagraphStyle(
        "footer", parent=styles["Normal"], fontSize=8, textColor=BRAND_GRAY, alignment=TA_CENTER
    )))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
