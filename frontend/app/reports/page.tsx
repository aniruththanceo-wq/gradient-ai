"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  LineChart,
  Lock,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/ui/status-message";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition, GlowingCard } from "@/components/motion/motion-primitives";
import { useAuth } from "@/hooks/use-auth";
import { downloadReportPdf } from "@/lib/api";
import {
  createAcademicReport,
  createPlacementReport,
  listAcademicRecords,
} from "@/services/gradient-api";
import type { ReportResult } from "@/types/api";

// Dynamically load 3D Document Matrix
const DocumentMatrix3D = dynamic(() => import("@/components/3d/document-matrix-3d"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ width: 140, height: 100, borderRadius: "var(--radius-md)" }} />,
});

export default function ReportsPage() {
  const { session } = useAuth();
  const [academicRecords, setAcademicRecords] = useState<{ id: string; semester: number; previous_cgpa: number; created_at: string }[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");

  const [generatingAcademic, setGeneratingAcademic] = useState(false);
  const [generatingPlacement, setGeneratingPlacement] = useState(false);
  const [downloadingAcademic, setDownloadingAcademic] = useState(false);
  const [downloadingPlacement, setDownloadingPlacement] = useState(false);

  const [academicReport, setAcademicReport] = useState<ReportResult | null>(null);
  const [placementReport, setPlacementReport] = useState<ReportResult | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecords() {
      try {
        const list = await listAcademicRecords();
        setAcademicRecords(list);
        if (list.length > 0) {
          setSelectedRecordId(list[0].id);
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Unable to load academic records.");
      }
    }
    loadRecords();
  }, []);

  async function downloadReport(reportId: string, filename: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    setErrorMessage(null);
    try {
      await downloadReportPdf(reportId, filename);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAcademicReport() {
    if (!selectedRecordId) {
      setErrorMessage("Please select an academic record first, or log your semester IA marks in the Academic workspace.");
      return;
    }

    setGeneratingAcademic(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const rep = await createAcademicReport(selectedRecordId);
      setAcademicReport(rep);
      setStatusMessage("Academic Intelligence Dossier compiled successfully! Click Download to save your official PDF.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to compile Academic report.");
    } finally {
      setGeneratingAcademic(false);
    }
  }

  async function handleGeneratePlacementReport() {
    setGeneratingPlacement(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const rep = await createPlacementReport();
      setPlacementReport(rep);
      setStatusMessage("Placement & Career Intelligence Dossier compiled successfully! Click Download to save your official PDF.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to compile Placement report. Ensure your Placement Profile and at least one assessment are completed.");
    } finally {
      setGeneratingPlacement(false);
    }
  }

  const isSenior = session?.profile ? session.profile.academic_year >= 3 : false;

  return (
    <PageTransition className="page-shell">
      <AppNav />

      <main className="section-sm">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Top Dossier Command Banner with 3D Holographic Crystal */}
          <div className="gradient-card card-pad" style={{ background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 280 }}>
              <div style={{ width: 140, height: 100 }}>
                <DocumentMatrix3D height={100} reportType={isSenior ? "placement" : "academic"} />
              </div>
              <div>
                <div className="eyebrow"><FileCheck size={13} /> Decision-Support Center</div>
                <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 800 }}>
                  Intelligence Dossier Center
                </h1>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
                  Compile verifiable PDF dossiers from your latest academic metrics, IA regression slopes, and placement capabilities.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge variant="emerald" icon={<ShieldCheck size={13} />}>
                ReportLab Server Engine Ready
              </Badge>
            </div>
          </div>

          {/* Feedback Messages */}
          {statusMessage && (
            <StatusMessage kind="success">
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> {statusMessage}
            </StatusMessage>
          )}
          {errorMessage && <StatusMessage kind="error">{errorMessage}</StatusMessage>}

          {/* Dossiers Grid */}
          <div className="grid-2">
            {/* 1. Academic Intelligence Report Card */}
            <Card elevated>
              <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <GraduationCap size={20} color="var(--primary)" /> Academic Intelligence Dossier
                  </CardTitle>
                  <Badge variant="emerald">Year 1 – 4</Badge>
                </div>
                <CardDescription>
                  Semester standing, IA linear regression, weak-subject diagnosis, attendance tracking, and balanced exam timetable
                </CardDescription>
              </CardHeader>

              <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Dossier Preview Blueprint */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--line)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
                    Document Sections Included:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> CGPA &amp; SGPA Trajectory
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> Multi-Exam IA Slopes
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> Weak-Subject Diagnosis
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> Attendance Safety Audit
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> Solved Exam Timetable
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <CheckCircle2 size={14} color="var(--primary)" /> Actionable Recommendations
                    </div>
                  </div>
                </div>

                {/* Record Selector */}
                {academicRecords.length > 1 && (
                  <div>
                    <label className="form-label" style={{ display: "block", marginBottom: 6 }}>
                      Select Semester Record
                    </label>
                    <select
                      className="form-select"
                      value={selectedRecordId}
                      onChange={(e) => setSelectedRecordId(e.target.value)}
                    >
                      {academicRecords.map((rec) => (
                        <option key={rec.id} value={rec.id}>
                          Semester {rec.semester} &bull; CGPA: {rec.previous_cgpa}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <Button
                    variant="primary"
                    onClick={handleGenerateAcademicReport}
                    isLoading={generatingAcademic}
                    leftIcon={<FileText size={16} />}
                  >
                    Compile Academic Dossier
                  </Button>

                  {academicReport && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        downloadReport(
                          academicReport.id,
                          academicReport.title || "academic_report.pdf",
                          setDownloadingAcademic
                        )
                      }
                      isLoading={downloadingAcademic}
                      leftIcon={<Download size={16} />}
                    >
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Placement Intelligence Report Card */}
            <Card elevated>
              <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Briefcase size={20} color="var(--teal)" /> Placement Readiness Dossier
                  </CardTitle>
                  <Badge variant={isSenior ? "emerald" : "neutral"}>
                    {isSenior ? "Year 3 & 4" : "Locked (Year 1–2)"}
                  </Badge>
                </div>
                <CardDescription>
                  6-dimension capability radar, portfolio audit, assessment scorecards, and Tier-1 company roadmap
                </CardDescription>
              </CardHeader>

              <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {!isSenior ? (
                  <div
                    style={{
                      padding: "24px 20px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-subtle)",
                      border: "1px dashed var(--line-strong)",
                      textAlign: "center",
                    }}
                  >
                    <Lock size={28} color="var(--ink-tertiary)" style={{ margin: "0 auto 10px" }} />
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>
                      Unlocks in Year 3
                    </div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                      Placement dossiers compile timed aptitude tests, static code evaluations, and portfolio credentials once you enter your 3rd year.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Dossier Preview Blueprint */}
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--surface-subtle)",
                        border: "1px solid var(--line)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
                        Document Sections Included:
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, fontSize: "0.85rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={14} color="var(--teal)" /> 6-Dimension Radar Map
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={14} color="var(--teal)" /> Placement Probability
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={14} color="var(--teal)" /> Bounded Package Estimate
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={14} color="var(--teal)" /> Aptitude &amp; Coding Breakdown
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={14} color="var(--teal)" /> Project &amp; Internship Audit
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={14} color="var(--teal)" /> Target Company Strategy
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                      <Button
                        variant="primary"
                        onClick={handleGeneratePlacementReport}
                        isLoading={generatingPlacement}
                        leftIcon={<FileText size={16} />}
                      >
                        Compile Placement Dossier
                      </Button>

                      {placementReport && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            downloadReport(
                              placementReport.id,
                              placementReport.title || "placement_report.pdf",
                              setDownloadingPlacement
                            )
                          }
                          isLoading={downloadingPlacement}
                          leftIcon={<Download size={16} />}
                        >
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer & Integrity Note */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              fontSize: "0.82rem",
              color: "var(--ink-secondary)",
              lineHeight: 1.6,
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>Responsible Intelligence Disclosure: </span>
            CGPA forecasts and placement probabilities generated in these dossiers are powered by scikit-learn Ridge and Logistic
            Regression models calibrated on prototype distributions. They provide indicative trajectory guidance and must not
            be construed as institutional guarantees.
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
