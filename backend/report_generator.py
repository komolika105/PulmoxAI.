import io
import base64
from datetime import datetime
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether


def generate_pdf_report(
    patient_name: str,
    prediction: str,
    confidence: float,
    probabilities: dict,
    gradcam_base64: str = None,
    created_at: datetime = None
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#0f172a") # Dark Slate
    TEAL = colors.HexColor("#0d9488")    # Medical Teal
    ACCENT = colors.HexColor("#2563eb")  # Deep Blue
    TEXT_DARK = colors.HexColor("#334155")
    BG_LIGHT = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=PRIMARY,
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=TEAL,
        spaceAfter=15
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        textColor=TEXT_DARK,
        leading=14
    )
    disclaimer_style = ParagraphStyle(
        "DisclaimerText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        textColor=colors.HexColor("#64748b"),
        leading=11
    )

    story = []

    # 1. Header & Branding
    story.append(Paragraph("PulmoXAI — Diagnostic Analysis Report", title_style))
    story.append(Paragraph("AI-Assisted Chest X-Ray Multi-Disease Classification & Explainability", subtitle_style))
    story.append(Spacer(1, 10))

    # 2. Patient & Scan Information Table
    date_str = (created_at or datetime.utcnow()).strftime("%B %d, %Y - %H:%M UTC")
    info_data = [
        [Paragraph("<b>Patient Name:</b>", body_style), Paragraph(patient_name or "Anonymous Patient", body_style)],
        [Paragraph("<b>Scan Date:</b>", body_style), Paragraph(date_str, body_style)],
        [Paragraph("<b>Model Backend:</b>", body_style), Paragraph("DenseNet121 + XAI Grad-CAM Engine", body_style)],
    ]
    info_table = Table(info_data, colWidths=[130, 410])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 15))

    # 3. AI Prediction Summary
    story.append(Paragraph("Primary AI Diagnostic Prediction", heading_style))

    conf_pct = f"{confidence * 100:.1f}%"
    pred_data = [
        [
            Paragraph(f"<font color='#0f172a' size=14><b>Predicted Condition: {prediction}</b></font>", body_style),
            Paragraph(f"<font color='#0d9488' size=14><b>Confidence: {conf_pct}</b></font>", body_style)
        ]
    ]
    pred_table = Table(pred_data, colWidths=[340, 200])
    pred_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4") if prediction == "No Finding" else colors.HexColor("#fef2f2")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#bbf7d0") if prediction == "No Finding" else colors.HexColor("#fecaca")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(pred_table)
    story.append(Spacer(1, 15))

    # 4. Class Probabilities Table
    story.append(Paragraph("Condition Probability Breakdown", heading_style))
    prob_rows = [["Disease Condition", "Model Probability Score", "Risk Category"]]
    
    for cls_name, prob_val in probabilities.items():
        prob_pct = f"{prob_val * 100:.2f}%"
        risk = "Low" if prob_val < 0.25 else ("Moderate" if prob_val < 0.5 else "High")
        prob_rows.append([cls_name, prob_pct, risk])

    prob_table = Table(prob_rows, colWidths=[200, 200, 140])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
    ]))
    story.append(prob_table)
    story.append(Spacer(1, 15))

    # 5. Grad-CAM Explainability Image
    if gradcam_base64 and "," in gradcam_base64:
        try:
            story.append(Paragraph("Explainable AI (Grad-CAM Activation Heatmap)", heading_style))
            img_data = base64.b64decode(gradcam_base64.split(",")[1])
            img_pil = PILImage.open(io.BytesIO(img_data))
            
            img_buf = io.BytesIO()
            img_pil.save(img_buf, format="PNG")
            img_buf.seek(0)
            
            rl_img = RLImage(img_buf, width=240, height=240)
            story.append(KeepTogether([rl_img, Spacer(1, 15)]))
        except Exception as e:
            print(f"Error rendering PDF image: {e}")

    # 6. Regulatory & Clinical Disclaimer
    disclaimer_text = (
        "<b>DISCLAIMER:</b> This document was generated automatically by PulmoXAI — an artificial intelligence "
        "decision support software intended exclusively for educational and research purposes. "
        "This tool is NOT a certified diagnostic medical device. Final clinical diagnoses must always be performed "
        "by a qualified radiologist or licensed medical professional."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    return buffer.getvalue()
