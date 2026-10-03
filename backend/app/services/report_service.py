from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

from fastapi import HTTPException
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.app_typing import UserLike
from app.core.config import get_settings
from app.models import AcademicPrediction, Certification, Course, Internship, Project, Report
from app.repositories.user_repository import UserRepository
from app.services.academic_analysis import analyze_record
from app.services.academic_service import get_academic_record
from app.services.placement_service import get_placement_profile, placement_feature_snapshot, placement_recommendations, placement_skill_gaps, prototype_package_range, readiness_dimensions


EMERALD = colors.HexColor("#12634e")
INK = colors.HexColor("#17231f")
MIST = colors.HexColor("#eef5f1")
LINE = colors.HexColor("#d6ddd8")


def _output_path(user_id: str, report_type: str) -> Path:
    root = Path(get_settings().pdf_output_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root / f"{report_type}-{user_id}.pdf"


def _page_chrome(canvas, document) -> None:
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, A4[0] - 18 * mm, 14 * mm)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#64736d"))
    canvas.drawString(18 * mm, 9 * mm, "Gradient AI | Student Intelligence Dossier")
    canvas.drawRightString(A4[0] - 18 * mm, 9 * mm, f"Page {document.page}")
    canvas.restoreState()


def _styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("DossierTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=28, leading=34, textColor=colors.white, alignment=TA_CENTER, spaceAfter=10))
    styles.add(ParagraphStyle("DossierSubtitle", parent=styles["BodyText"], fontSize=11, leading=16, textColor=colors.HexColor("#d8eee4"), alignment=TA_CENTER))
    styles.add(ParagraphStyle("DossierHeading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=20, textColor=EMERALD, spaceBefore=14, spaceAfter=7))
    styles.add(ParagraphStyle("DossierBody", parent=styles["BodyText"], fontSize=9.5, leading=14, textColor=INK, spaceAfter=5))
    styles.add(ParagraphStyle("DossierSmall", parent=styles["BodyText"], fontSize=8.5, leading=12, textColor=colors.HexColor("#4d5c56")))
    return styles


def _metric_table(metrics: list[tuple[str, str]], styles) -> Table:
    rows = [[Paragraph(f"<b>{escape(label)}</b><br/><font size=15 color='#12634e'>{escape(value)}</font>", styles["DossierBody"]) for label, value in metrics[i:i + 3]] for i in range(0, len(metrics), 3)]
    for row in rows:
        while len(row) < 3:
            row.append("")
    table = Table(rows, colWidths=[55 * mm] * 3, hAlign="LEFT")
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), MIST), ("BOX", (0, 0), (-1, -1), 0.6, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    return table


def _build_pdf(path: Path, title: str, subtitle: str, metrics: list[tuple[str, str]], sections: list[tuple[str, list[str]]]) -> None:
    styles = _styles()
    document = SimpleDocTemplate(str(path), pagesize=A4, title=title, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=18 * mm, bottomMargin=20 * mm)
    cover = Table([[Paragraph("GRADIENT AI", styles["DossierSubtitle"])], [Paragraph(title, styles["DossierTitle"])], [Paragraph(subtitle, styles["DossierSubtitle"])]], colWidths=[174 * mm])
    cover.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), INK), ("TOPPADDING", (0, 0), (-1, 0), 24), ("BOTTOMPADDING", (0, -1), (-1, -1), 24), ("LEFTPADDING", (0, 0), (-1, -1), 20), ("RIGHTPADDING", (0, 0), (-1, -1), 20)]))
    story = [Spacer(1, 40 * mm), cover, Spacer(1, 20 * mm), Paragraph("Decision-support dossier", styles["DossierHeading"]), Paragraph("This report translates entered records and prototype-model outputs into practical study and preparation signals. It is advisory, not a guarantee of academic or hiring outcomes.", styles["DossierBody"]), PageBreak(), Paragraph("Intelligence Snapshot", styles["DossierHeading"]), _metric_table(metrics, styles), Spacer(1, 8)]
    for heading, lines in sections:
        story.append(Paragraph(escape(heading), styles["DossierHeading"]))
        for line in lines:
            story.append(Paragraph(escape(line), styles["DossierBody"]))
    story.extend([Spacer(1, 12), Paragraph("Responsible use", styles["DossierHeading"]), Paragraph("Gradient AI uses student-provided data and prototype models for decision support. Review recommendations with your institution, and do not interpret a prediction, score, or package range as a guaranteed outcome.", styles["DossierSmall"])])
    document.build(story, onFirstPage=_page_chrome, onLaterPages=_page_chrome)


def create_academic_report(db: Session, user: UserLike, record_id: str) -> Report:
    profile = UserRepository(db).get_profile(user.id)
    record = get_academic_record(db, user.id, record_id)
    analysis = analyze_record(record)
    latest_prediction = db.query(AcademicPrediction).filter(AcademicPrediction.academic_record_id == record.id, AcademicPrediction.user_id == user.id).order_by(AcademicPrediction.created_at.desc()).first()
    subject_lines = [f"{item['subject']}: {item['average_percentage']}% average, {item['trend']} trend, {item['priority']} priority. {'; '.join(item['reasons'])}" for item in analysis["subjects"]]
    path = _output_path(user.id, "academic")
    _build_pdf(path, "Academic Intelligence Dossier", f"Semester {record.semester} | {profile.full_name if profile else 'Student'}", [("IA average", f"{analysis['average_ia_percentage']}%"), ("Attendance", f"{record.attendance_percentage}%"), ("Previous CGPA", str(record.previous_cgpa)), ("Forecast", f"{latest_prediction.predicted_cgpa:.2f} / 10" if latest_prediction else "Generate forecast"), ("Top priority", analysis["weakest_subject"] or "None"), ("Trend", analysis["overall_trend"].title())], [
        ("Executive summary", [f"{analysis['weakest_subject'] or 'No subject'} is the current highest-priority focus. {analysis['strongest_subject'] or 'No subject'} is the strongest current signal."]),
        ("Student and study profile", [f"College: {profile.college if profile else 'Not provided'}", f"Department: {profile.department if profile else 'Not provided'}", f"Study rhythm: {record.weekday_study_hours} weekday hours and {record.weekend_study_hours} weekend hours.", f"Preferred study approach: {record.study_method}." ]),
        ("IA progression and subject health", subject_lines),
        ("Risk and forecast interpretation", [f"Attendance contribution: {'below the 75% advisory threshold' if record.attendance_percentage < 75 else 'within the advisory threshold'}.", "CGPA forecasts are prototype estimates based on the current academic record, not validated guarantees."]),
        ("Recommended next actions", analysis["recommendations"] + ["Use the timetable generator with dated exams to convert subject priorities into revision blocks."]),
    ])
    report = Report(user_id=user.id, report_type="academic", title="Academic Intelligence Dossier", file_path=str(path))
    db.add(report); db.commit(); db.refresh(report)
    return report


def create_placement_report(db: Session, user: UserLike) -> Report:
    profile = UserRepository(db).get_profile(user.id)
    placement = get_placement_profile(db, user.id)
    if placement is None:
        raise HTTPException(status_code=404, detail="Placement profile is required before generating a placement report")
    features = placement_feature_snapshot(db, user.id, placement)
    dimensions = readiness_dimensions(features)
    expected, low, high = prototype_package_range(dimensions)
    projects = db.query(Project).filter(Project.user_id == user.id).all()
    internships = db.query(Internship).filter(Internship.user_id == user.id).all()
    certifications = db.query(Certification).filter(Certification.user_id == user.id).all()
    courses = db.query(Course).filter(Course.user_id == user.id).all()
    gaps = placement_skill_gaps(features)
    path = _output_path(user.id, "placement")
    _build_pdf(path, "Placement Intelligence Dossier", f"Career readiness for {profile.full_name if profile else 'Student'}", [("Readiness", f"{sum(dimensions.values()) / len(dimensions):.0f}%"), ("Package range", f"₹{low}–₹{high} LPA"), ("CGPA", str(placement.cgpa)), ("Aptitude", f"{placement.aptitude_score}%"), ("Coding", f"{placement.coding_score}%"), ("Communication", f"{placement.communication_score}%")], [
        ("Candidate profile", [f"Target role: {placement.target_role}", f"Languages: {', '.join(placement.programming_languages) or 'Not added'}", f"Technical skills: {', '.join(placement.technical_skills) or 'Not added'}", f"DSA preparation: {placement.dsa_preparation}."]),
        ("Six-dimension readiness", [f"{name.title()}: {value:.0f}%" for name, value in dimensions.items()]),
        ("Portfolio evidence", [f"Projects ({len(projects)}): {', '.join(item.title for item in projects) or 'Not added'}", f"Internships ({len(internships)}): {', '.join(item.organization for item in internships) or 'Not added'}", f"Certifications ({len(certifications)}): {', '.join(item.name for item in certifications) or 'Not added'}", f"Courses ({len(courses)}): {', '.join(item.name for item in courses) or 'Not added'}"]),
        ("Prototype package interpretation", [f"Prototype estimated package range: ₹{low}–₹{high} LPA (central estimate ₹{expected} LPA).", "This bounded advisory range reflects all six readiness dimensions. Employer demand, market conditions, interviews, and many other factors determine real outcomes."]),
        ("Preparation priorities", [f"Skill gaps: {', '.join(gaps) or 'No major gaps identified'}"] + placement_recommendations(features, gaps)),
    ])
    report = Report(user_id=user.id, report_type="placement", title="Placement Intelligence Dossier", file_path=str(path))
    db.add(report); db.commit(); db.refresh(report)
    return report


def get_report_for_user(db: Session, user_id: str, report_id: str) -> Report:
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == user_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
