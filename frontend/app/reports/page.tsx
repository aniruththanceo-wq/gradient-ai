"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  GraduationCap,
  Lock,
  Sparkles,
} from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusMessage } from "@/components/ui/status-message";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { getStoredToken } from "@/lib/api";
import {
  createAcademicReport,
  createPlacementReport,
  listAcademicRecords,
} from "@/services/gradient-api";
import type { ReportResult } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

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
      } catch {
        // ignore
      }
    }
    loadRecords();
  }, []);

  /**
   * Download a report PDF with auth headers.
   * Uses fetch + createObjectURL to trigger download in-browser,
   * so Bearer tokens are correctly sent even without cookie support.
   */
  async function downloadReport(reportId: string, filename: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = getStoredToken();
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/reports/${reportId}/download`, {
        credentials: "include",
        headers,
      });
      if (!res.ok) {
        throw new Error(`Failed to download PDF (HTTP ${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
      setStatusMessage("Academic Intelligence PDF compiled successfully — click Download to save.");
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
      setStatusMessage("Placement & Career Intelligence PDF compiled successfully — click Download to save.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to compile Placement report. Ensure your Placement Profile and at least one assessment are completed.");
    } finally {
      setGeneratingPlacement(false);
    }
  }

  const isSenior = session?.profile ? session.profile.academic_year >= 3 : false;

  return (
    <div className="page-shell">
      <AppNav />

      <main className="section-sm">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Header */}
          <div>
            <div className="eyebrow"><FileText size={14} /> Intelligence Reports</div>
            <h1 className="section-title">PDF Report Generation</h1>
            <p className="lead-text" style={{ margin: 0, fontSize: "0.95rem" }}>
              Generate and download server-compiled PDF documents summarizing your academic performance and placement readiness.
              Reports are generated by the backend via ReportLab and are not cached — each compilation reflects your latest data.
            </p>
          </div>

          {/* Feedback Messages */}
          {statusMessage && (
            <StatusMessage kind="success">
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> {statusMessage}
            </StatusMessage>
          )}
          {errorMessage && <StatusMessage kind="error">{errorMessage}</StatusMessage>}

          {/* Reports Grid */}
          <div className="grid-2">
            {/* 1. Academic Intelligence Report */}
            <Card elevated>
              <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <GraduationCap size={20} color="var(--primary)" /> Academic Intelligence Report
                  </CardTitle>
                  <Badge variant="emerald">Year 1 – 4</Badge>
                </div>
                <CardDescription>
                  Complete academic standing, IA progression, weak-subject diagnosis, and personalized exam timetable
                </CardDescription>
              </CardHeader>

              <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                    Report Includes:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                    <li>Verified institutional profile and semester details</li>
                    <li>10th / 12th percentages, prior CGPA, and attendance compliance</li>
                    <li>Per-subject IA trajectory table with mathematical slope indices</li>
                    <li>Weak-subject diagnosis with attendance penalty warnings</li>
                    <li>ML-predicted final CGPA and academic risk classification</li>
                    <li>Full personalized study timetable with timed revision blocks</li>
                  </ul>
                </div>

                {academicRecords.length > 0 ? (
                  <div>
                    <label className="form-label" style={{ display: "block", marginBottom: 6 }}>
                      Semester Record to Compile
                    </label>
                    <select
                      className="form-select"
                      value={selectedRecordId}
                      onChange={(e) => setSelectedRecordId(e.target.value)}
                    >
                      {academicRecords.map((rec) => (
                        <option key={rec.id} value={rec.id}>
                          Semester {rec.semester} — CGPA {rec.previous_cgpa.toFixed(2)} &bull;{" "}
                          {new Date(rec.created_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--amber-subtle)",
                      border: "1px solid rgba(192,120,23,0.25)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.83rem",
                      color: "var(--amber)",
                      fontWeight: 600,
                    }}
                  >
                    No academic records found — log your semester IA marks in the Academic workspace first.
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleGenerateAcademicReport}
                    isLoading={generatingAcademic}
                    disabled={!selectedRecordId}
                    leftIcon={<FileCheck size={16} />}
                  >
                    Compile Academic PDF
                  </Button>

                  {academicReport && (
                    <Button
                      type="button"
                      variant="secondary"
                      isLoading={downloadingAcademic}
                      leftIcon={<Download size={15} />}
                      onClick={() =>
                        downloadReport(
                          academicReport.id,
                          `gradient-ai-academic-report.pdf`,
                          setDownloadingAcademic
                        )
                      }
                    >
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Placement Intelligence Report (Year 3 & 4) */}
            <Card elevated>
              <CardHeader>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Briefcase size={20} color="var(--primary)" /> Placement Intelligence Report
                  </CardTitle>
                  <Badge variant="year">Year 3 &amp; 4 Only</Badge>
                </div>
                <CardDescription>
                  Full placement dossier, 6-dimension readiness radar, timed assessment scores, and target company roadmaps
                </CardDescription>
              </CardHeader>

              <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {!isSenior ? (
                  <div
                    style={{
                      padding: "24px",
                      background: "var(--surface-subtle)",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                      border: "1px dashed var(--line-strong)",
                    }}
                  >
                    <Lock size={28} color="var(--ink-tertiary)" style={{ margin: "0 auto 10px" }} />
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)", marginBottom: 6 }}>
                      Locked for Year {session?.profile?.academic_year ?? 1} Students
                    </div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                      Placement Dossier reports compile industry internships, engineering projects, and Tier-1 assessment ratings.
                      This feature unlocks automatically when you enter Year 3.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
                        Report Includes:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                        <li>Comprehensive placement profile, target role, and technical skills</li>
                        <li>Project repository and verified internship outcome log</li>
                        <li>Timed Aptitude, Safe Coding Review, and Communication scorecards</li>
                        <li>6-Dimension readiness breakdown (Academics, Aptitude, Coding, Comm, Portfolio, Skills)</li>
                        <li>Placement probability forecast and expected package range (prototype model)</li>
                        <li>Tier-1 target company strategy roadmap (Google, Amazon, Microsoft, etc.)</li>
                      </ul>
                    </div>

                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleGeneratePlacementReport}
                        isLoading={generatingPlacement}
                        leftIcon={<FileCheck size={16} />}
                      >
                        Compile Placement PDF
                      </Button>

                      {placementReport && (
                        <Button
                          type="button"
                          variant="secondary"
                          isLoading={downloadingPlacement}
                          leftIcon={<Download size={15} />}
                          onClick={() =>
                            downloadReport(
                              placementReport.id,
                              `gradient-ai-placement-report.pdf`,
                              setDownloadingPlacement
                            )
                          }
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

          {/* ML Responsibility Disclosure */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              fontSize: "0.8rem",
              color: "var(--ink-secondary)",
              lineHeight: 1.55,
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>Prototype Data Disclaimer: </span>
            CGPA prediction and placement probability values in these reports are generated by scikit-learn Ridge and Logistic
            Regression models trained on synthetic data for development purposes. They are illustrative only and should not
            be used as validated indicators of academic or professional outcomes.
          </div>
        </div>
      </main>
    </div>
  );
}
