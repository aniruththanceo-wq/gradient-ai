"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Layers,
  LineChart as LineChartIcon,
  Plus,
  Printer,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppNav } from "@/components/layout/app-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, RiskBadge, PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { StatusMessage } from "@/components/ui/status-message";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { IATrendChart } from "@/components/charts/ia-trend-chart";
import { CGPARing } from "@/components/charts/cgpa-ring";
import { RiskMatrix } from "@/components/charts/risk-matrix";
import { PageTransition, GlowingCard, AnimatedCounter } from "@/components/motion/motion-primitives";
import { useAuth } from "@/hooks/use-auth";
import { downloadReportPdf } from "@/lib/api";
import {
  createAcademicReport,
  generateTimetable,
  getAcademicAnalysis,
  listAcademicRecords,
  predictAcademic,
  saveAcademicRecord,
} from "@/services/gradient-api";
import type {
  AcademicAnalysis,
  AcademicPredictionResult,
  AcademicRecordPayload,
  SubjectPayload,
  TimetableResult,
} from "@/types/api";

// Dynamically load 3D visual modules
const TrajectoryNetwork = dynamic(() => import("@/components/3d/trajectory-network"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: "var(--radius-md)" }} />,
});

const TemporalMatrix3D = dynamic(() => import("@/components/3d/temporal-matrix-3d"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ width: "100%", height: 160, borderRadius: "var(--radius-md)" }} />,
});

export default function AcademicPage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<"records" | "analytics" | "timetable">("records");

  // Form State
  const [semester, setSemester] = useState(session?.profile?.semester || 2);
  const [tenth, setTenth] = useState(88.5);
  const [twelfth, setTwelfth] = useState(86.0);
  const [prevCGPA, setPrevCGPA] = useState(8.1);
  const [prevSGPA, setPrevSGPA] = useState(8.3);
  const [attendance, setAttendance] = useState(82.0);
  const [weekdayHours, setWeekdayHours] = useState(3.0);
  const [weekendHours, setWeekendHours] = useState(5.5);
  const [consistency, setConsistency] = useState("consistent");
  const [preferredTime, setPreferredTime] = useState("evening");
  const [revisionFreq, setRevisionFreq] = useState("weekly");
  const [studyMethod, setStudyMethod] = useState("concept mapping & problem solving");

  // Dynamic Subjects & Flexible IA exams
  const [subjects, setSubjects] = useState<SubjectPayload[]>([
    {
      name: "Data Structures & Algorithms",
      code: "CS201",
      max_ia_marks: 50,
      attendance_percentage: 86,
      ia_marks: [
        { assessment_index: 1, title: "IA 1", marks_obtained: 38, max_marks: 50 },
        { assessment_index: 2, title: "IA 2", marks_obtained: 42, max_marks: 50 },
        { assessment_index: 3, title: "IA 3", marks_obtained: 46, max_marks: 50 },
      ],
    },
    {
      name: "Discrete Mathematics",
      code: "MA201",
      max_ia_marks: 50,
      attendance_percentage: 70,
      ia_marks: [
        { assessment_index: 1, title: "IA 1", marks_obtained: 36, max_marks: 50 },
        { assessment_index: 2, title: "IA 2", marks_obtained: 31, max_marks: 50 },
        { assessment_index: 3, title: "IA 3", marks_obtained: 27, max_marks: 50 },
      ],
    },
    {
      name: "Computer Organization",
      code: "CS202",
      max_ia_marks: 50,
      attendance_percentage: 80,
      ia_marks: [
        { assessment_index: 1, title: "IA 1", marks_obtained: 32, max_marks: 50 },
        { assessment_index: 2, title: "IA 2", marks_obtained: 40, max_marks: 50 },
        { assessment_index: 3, title: "IA 3", marks_obtained: 35, max_marks: 50 },
      ],
    },
  ]);

  // Saved Record & Analytics State
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<{ id: string; semester: number; previous_cgpa: number; created_at: string }[]>([]);
  const [analysis, setAnalysis] = useState<AcademicAnalysis | null>(null);
  const [prediction, setPrediction] = useState<AcademicPredictionResult | null>(null);
  const [timetable, setTimetable] = useState<TimetableResult | null>(null);

  // Timetable Generator Form State
  const [examDates, setExamDates] = useState<{ subject_name: string; exam_date: string }[]>([]);
  const [availableDailyHours, setAvailableDailyHours] = useState(4);
  const [preferredStartTime, setPreferredStartTime] = useState("09:00");
  const [blockDuration, setBlockDuration] = useState(60);
  const [includeWeekends, setIncludeWeekends] = useState(true);

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [generatingTT, setGeneratingTT] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  useEffect(() => {
    loadExistingRecords();
  }, []);

  async function loadExistingRecords() {
    try {
      const records = await listAcademicRecords();
      setSavedRecords(records);
      if (records.length > 0) {
        const latest = records[0];
        setActiveRecordId(latest.id);
        loadRecordAnalysis(latest.id);
      }
    } catch {
      // fallback
    }
  }

  async function loadRecordAnalysis(recordId: string) {
    try {
      const ana = await getAcademicAnalysis(recordId);
      setAnalysis(ana);
      const pred = await predictAcademic(recordId);
      setPrediction(pred);
    } catch {
      // fallback
    }
  }

  // Subject Modification Helpers
  function addSubject() {
    setSubjects([
      ...subjects,
      {
        name: `Subject ${subjects.length + 1}`,
        code: `CS${300 + subjects.length}`,
        max_ia_marks: 50,
        attendance_percentage: 80,
        ia_marks: [
          { assessment_index: 1, title: "IA 1", marks_obtained: 35, max_marks: 50 },
          { assessment_index: 2, title: "IA 2", marks_obtained: 35, max_marks: 50 },
        ],
      },
    ]);
  }

  function removeSubject(index: number) {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  }

  function addIAMark(subjectIndex: number) {
    const updated = [...subjects];
    const sub = updated[subjectIndex];
    const nextIndex = sub.ia_marks.length + 1;
    sub.ia_marks.push({
      assessment_index: nextIndex,
      title: `IA ${nextIndex}`,
      marks_obtained: Math.round(sub.max_ia_marks * 0.7),
      max_marks: sub.max_ia_marks,
    });
    setSubjects(updated);
  }

  function removeIAMark(subjectIndex: number, markIndex: number) {
    const updated = [...subjects];
    const sub = updated[subjectIndex];
    if (sub.ia_marks.length <= 1) return;
    sub.ia_marks = sub.ia_marks.filter((_, i) => i !== markIndex);
    sub.ia_marks.forEach((m, idx) => {
      m.assessment_index = idx + 1;
      m.title = `IA ${idx + 1}`;
    });
    setSubjects(updated);
  }

  // Submit Academic Record Flow
  async function handleSubmitRecord(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const payload: AcademicRecordPayload = {
      semester,
      tenth_percentage: tenth,
      twelfth_percentage: twelfth,
      previous_cgpa: prevCGPA,
      previous_sgpa: prevSGPA,
      attendance_percentage: attendance,
      weekday_study_hours: weekdayHours,
      weekend_study_hours: weekendHours,
      consistency,
      preferred_study_time: preferredTime,
      revision_frequency: revisionFreq,
      study_method: studyMethod,
      subjects,
    };

    try {
      const result = await saveAcademicRecord(payload);
      setActiveRecordId(result.id);
      setExamDates((current) => current.length ? current : payload.subjects.map((subject) => ({
        subject_name: subject.name,
        exam_date: "",
      })));
      setStatusMessage("Academic Record successfully saved & verified.");
      await loadExistingRecords();
      await loadRecordAnalysis(result.id);
      setActiveTab("analytics");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save academic record.");
    } finally {
      setSaving(false);
    }
  }

  // Timetable Generator Flow
  async function handleGenerateTimetable() {
    if (!activeRecordId) {
      setErrorMessage("Please save your academic records first before solving the timetable.");
      return;
    }

    const validExamDates = examDates.filter((ed) => ed.subject_name.trim() && ed.exam_date.trim());
    if (validExamDates.length === 0) {
      setErrorMessage("Please specify at least one subject with a valid exam date.");
      return;
    }

    setGeneratingTT(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const tt = await generateTimetable({
        academic_record_id: activeRecordId,
        available_study_hours_per_day: availableDailyHours,
        exam_dates: validExamDates,
        preferred_start_time: preferredStartTime,
        block_minutes: blockDuration,
        include_weekends: includeWeekends,
      });
      setTimetable(tt);
      setStatusMessage("Exam timetable generated and balanced with weak-subject weighting.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to solve exam timetable.");
    } finally {
      setGeneratingTT(false);
    }
  }

  // PDF Report Compilation & Download
  async function handleCreateReport() {
    if (!activeRecordId) return;
    setGeneratingReport(true);
    setErrorMessage(null);
    try {
      const rep = await createAcademicReport(activeRecordId);
      setGeneratedReportId(rep.id);
      setStatusMessage("Academic Intelligence Dossier compiled! Click Download PDF below.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Report compilation failed.");
    } finally {
      setGeneratingReport(false);
    }
  }

  async function handleDownloadReport() {
    if (!generatedReportId) return;
    setDownloadingReport(true);
    try {
      await downloadReportPdf(generatedReportId, `Gradient_Academic_Dossier_Sem${semester}.pdf`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to download PDF.");
    } finally {
      setDownloadingReport(false);
    }
  }

  return (
    <PageTransition className="page-shell">
      <AppNav />

      <main className="section-sm">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header & Tabs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="eyebrow"><GraduationCap size={14} /> Analytics Workspace</div>
              <h1 className="section-title">Academic Intelligence</h1>
              <p className="lead-text" style={{ margin: 0, fontSize: "0.95rem" }}>
                Multi-subject IA linear regression, weak-subject diagnosis, attendance tracking, and balanced exam scheduling.
              </p>
            </div>

            <Tabs
              activeTab={activeTab}
              onChange={(t) => setActiveTab(t as any)}
              tabs={[
                { id: "records", label: "Data Intake", icon: <Layers size={15} /> },
                { id: "analytics", label: "Analytics & Trends", icon: <LineChartIcon size={15} /> },
                { id: "timetable", label: "Exam Timetable", icon: <CalendarDays size={15} /> },
              ]}
            />
          </div>

          {/* Feedback Messages */}
          {statusMessage && (
            <StatusMessage kind="success">
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /> {statusMessage}
            </StatusMessage>
          )}
          {errorMessage && <StatusMessage kind="error">{errorMessage}</StatusMessage>}

          {/* TAB 1: ACADEMIC DATA ENTRY & DYNAMIC SUBJECTS */}
          {activeTab === "records" && (
            <form onSubmit={handleSubmitRecord} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Card elevated>
                <CardHeader>
                  <CardTitle>Academic Standing &amp; Study Profile</CardTitle>
                  <CardDescription>
                    Enter your prior semester baseline, attendance, and study habits to calibrate the regression model.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid-4" style={{ marginBottom: 20 }}>
                    <Input
                      label="Current Semester"
                      type="number"
                      min={1}
                      max={8}
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Prior CGPA (/10)"
                      type="number"
                      step="0.01"
                      min={0}
                      max={10}
                      value={prevCGPA}
                      onChange={(e) => setPrevCGPA(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Prior SGPA (/10)"
                      type="number"
                      step="0.01"
                      min={0}
                      max={10}
                      value={prevSGPA}
                      onChange={(e) => setPrevSGPA(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Overall Attendance %"
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={attendance}
                      onChange={(e) => setAttendance(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="grid-4">
                    <Input
                      label="Weekday Study (hrs/day)"
                      type="number"
                      step="0.5"
                      min={0}
                      max={16}
                      value={weekdayHours}
                      onChange={(e) => setWeekdayHours(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Weekend Study (hrs/day)"
                      type="number"
                      step="0.5"
                      min={0}
                      max={16}
                      value={weekendHours}
                      onChange={(e) => setWeekendHours(Number(e.target.value))}
                      required
                    />
                    <Select
                      label="Study Consistency"
                      value={consistency}
                      onChange={(e) => setConsistency(e.target.value)}
                    >
                      <option value="consistent">Consistent Daily</option>
                      <option value="moderate">Moderate Weekly</option>
                      <option value="irregular">Irregular / Exam Cram</option>
                    </Select>
                    <Select
                      label="Revision Frequency"
                      value={revisionFreq}
                      onChange={(e) => setRevisionFreq(e.target.value)}
                    >
                      <option value="daily">Daily Recall</option>
                      <option value="weekly">Weekly Summary</option>
                      <option value="monthly">Monthly Milestone</option>
                      <option value="before_exams">Exam Proximity Only</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Enrolled Subjects & Flexible IA Marks */}
              <Card elevated>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <CardTitle>Enrolled Subjects &amp; Internal Assessment (IA) Tests</CardTitle>
                      <CardDescription>
                        Track flexible IA marks (IA1 through IA4+) per subject. Slopes and risk factors are automatically calculated.
                      </CardDescription>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={addSubject} leftIcon={<Plus size={15} />}>
                      Add Subject
                    </Button>
                  </div>
                </CardHeader>

                <CardContent style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {subjects.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="gradient-card card-pad"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--line-strong)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      {/* Subject Metadata Row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 260, flexWrap: "wrap" }}>
                          <div style={{ flex: 2, minWidth: 160 }}>
                            <Input
                              label="Subject Name"
                              value={sub.name}
                              onChange={(e) => {
                                const next = [...subjects];
                                next[sIdx].name = e.target.value;
                                setSubjects(next);
                              }}
                              required
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 100 }}>
                            <Input
                              label="Code"
                              value={sub.code || ""}
                              onChange={(e) => {
                                const next = [...subjects];
                                next[sIdx].code = e.target.value;
                                setSubjects(next);
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 110 }}>
                            <Input
                              label="Attendance %"
                              type="number"
                              min={0}
                              max={100}
                              value={sub.attendance_percentage || ""}
                              onChange={(e) => {
                                const next = [...subjects];
                                next[sIdx].attendance_percentage = Number(e.target.value);
                                setSubjects(next);
                              }}
                            />
                          </div>
                        </div>

                        {subjects.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubject(sIdx)}
                            style={{ color: "var(--danger)", marginTop: 24 }}
                            aria-label={`Remove subject ${sub.name}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>

                      {/* IA Marks Row */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
                            Internal Assessments (IA Exams)
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addIAMark(sIdx)}
                            leftIcon={<Plus size={13} />}
                            style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                          >
                            Add IA Exam
                          </Button>
                        </div>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {sub.ia_marks.map((ia, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 12px",
                                borderRadius: "var(--radius-sm)",
                                background: "var(--surface-subtle)",
                                border: "1px solid var(--line)",
                              }}
                            >
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)" }}>{ia.title}:</span>
                              <input
                                type="number"
                                min={0}
                                max={ia.max_marks}
                                value={ia.marks_obtained}
                                onChange={(e) => {
                                  const next = [...subjects];
                                  next[sIdx].ia_marks[mIdx].marks_obtained = Number(e.target.value);
                                  setSubjects(next);
                                }}
                                style={{
                                  width: 50,
                                  padding: "4px 6px",
                                  border: "1px solid var(--line-strong)",
                                  borderRadius: 4,
                                  fontSize: "0.85rem",
                                  textAlign: "center",
                                }}
                                required
                              />
                              <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>/ {ia.max_marks}</span>
                              {sub.ia_marks.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeIAMark(sIdx, mIdx)}
                                  style={{ background: "none", border: "none", color: "var(--ink-tertiary)", cursor: "pointer", padding: 2 }}
                                  title="Remove IA"
                                  aria-label={`Remove ${ia.title}`}
                                >
                                  &times;
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <Button type="submit" variant="primary" size="lg" isLoading={saving}>
                      Save Academic Records &amp; Run Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* TAB 2: ANALYTICS & REGRESSION TRENDS */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {!analysis ? (
                <EmptyState
                  icon={<BarChart3 size={32} color="var(--primary)" />}
                  title="No Academic Analysis Available"
                  description="Save your semester subjects and IA marks first to generate progression slopes and CGPA forecasts."
                  action={
                    <Button variant="primary" size="md" onClick={() => setActiveTab("records")}>
                      Enter Academic Data
                    </Button>
                  }
                />
              ) : (
                <>
                  {/* Visual 3D Trajectory Banner & Action Row */}
                  <div className="gradient-card card-pad" style={{ background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 280 }}>
                      <div style={{ width: 140, height: 100 }}>
                        <TrajectoryNetwork height={100} subjectsCount={subjects.length} averageTrend={prediction?.risk_level === "High Risk" ? "declining" : "improving"} />
                      </div>
                      <div>
                        <div className="eyebrow"><Sparkles size={13} /> Mathematical Trajectory Model</div>
                        <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800 }}>
                          Multi-Subject Regression Diagnostic
                        </h2>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                          Evaluating {subjects.length} enrolled subjects across all recorded internal assessments.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Button variant="secondary" size="sm" onClick={() => loadRecordAnalysis(activeRecordId!)} leftIcon={<RefreshCw size={14} />}>
                        Refresh
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleCreateReport} isLoading={generatingReport} leftIcon={<FileText size={14} />}>
                        Compile Dossier
                      </Button>
                      {generatedReportId && (
                        <Button variant="outline" size="sm" onClick={handleDownloadReport} isLoading={downloadingReport} leftIcon={<Download size={14} />}>
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Core Metric Cards */}
                  <div className="grid-4">
                    <MetricCard
                      title="Current Baseline"
                      value={prevCGPA ? `${prevCGPA.toFixed(2)}` : "—"}
                      subValue="Institutional CGPA"
                    />
                    <MetricCard
                      title="Predicted CGPA"
                      value={prediction?.predicted_cgpa ? `${prediction.predicted_cgpa.toFixed(2)}` : "—"}
                      subValue="ML Ridge Model"
                      trend="improving"
                      trendLabel="Predicted"
                    />
                    <MetricCard
                      title="Academic Risk"
                      value={prediction?.risk_level ? prediction.risk_level.replace(" Risk", "") : "Low"}
                      subValue={prediction?.risk_level === "High Risk" ? "Immediate Attention" : "Within Parameters"}
                      trend={prediction?.risk_level === "High Risk" ? "declining" : "improving"}
                    />
                    <MetricCard
                      title="Attendance Health"
                      value={attendance ? `${attendance.toFixed(1)}%` : "—"}
                      subValue={attendance < 75 ? "Below Safety Line" : "Compliant (>75%)"}
                      trend={attendance < 75 ? "declining" : "improving"}
                    />
                  </div>

                  {/* Multi-Subject IA Trend Chart & Risk Matrix */}
                  <div className="grid-2-1">
                    <Card elevated>
                      <CardHeader>
                        <CardTitle>Internal Assessment Progression Trendlines</CardTitle>
                        <CardDescription>
                          Interactive trajectory curves across IA1, IA2, IA3, and IA4+ per subject
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <IATrendChart subjects={analysis.subjects} height={320} />
                      </CardContent>
                    </Card>

                    <Card elevated>
                      <CardHeader>
                        <CardTitle>Academic Risk Factors</CardTitle>
                        <CardDescription>
                          Weighted risk decomposition matrix
                        </CardDescription>
                      </CardHeader>
                      <CardContent style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <RiskMatrix
                          riskLevel={prediction?.risk_level || "Low Risk"}
                          contributingFactors={prediction?.contributing_factors}
                          attendanceRate={attendance}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Subject Diagnostic Details */}
                  <div className="grid-2">
                    <Card elevated>
                      <CardHeader>
                        <CardTitle>Individual Subject Trajectory Diagnosis</CardTitle>
                        <CardDescription>
                          Regression slope, average marks, and weakness explanations
                        </CardDescription>
                      </CardHeader>
                      <CardContent style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {analysis.subjects.map((sub, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              padding: "14px 16px",
                              borderRadius: "var(--radius-sm)",
                              background: "var(--surface-subtle)",
                              border: "1px solid var(--line)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{sub.subject}</span>
                              <div style={{ display: "flex", gap: 6 }}>
                                <Badge
                                  variant={
                                    sub.trend === "improving"
                                      ? "emerald"
                                      : sub.trend === "declining"
                                      ? "danger"
                                      : "amber"
                                  }
                                >
                                  {sub.trend}
                                </Badge>
                                <PriorityBadge priority={sub.priority} />
                              </div>
                            </div>

                            <div style={{ fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
                              IA Average: <strong>{sub.average_percentage}%</strong> &bull; Latest Exam: <strong>{sub.latest_percentage}%</strong>
                              {sub.attendance_percentage !== null && ` &bull; Attendance: ${sub.attendance_percentage}%`}
                            </div>

                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "var(--ink)", lineHeight: 1.5 }}>
                              {sub.reasons.map((r, rIdx) => (
                                <li key={rIdx}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Academic Recommendations & Timetable CTA */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <Card>
                        <CardHeader>
                          <CardTitle>Targeted Study Recommendations</CardTitle>
                          <CardDescription>
                            Prioritized action items derived from your regression patterns
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {analysis.recommendations.map((rec, rIdx) => (
                              <div key={rIdx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <CheckCircle2 size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                                <span style={{ fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.5 }}>
                                  {rec}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Launch Timetable Banner */}
                      <div
                        className="gradient-card card-pad"
                        style={{
                          background: "var(--primary-subtle)",
                          border: "1px solid rgba(18, 99, 78, 0.25)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <CalendarDays size={20} color="var(--primary)" />
                          <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--primary)" }}>
                            Generate Exam Revision Timetable
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.5 }}>
                          Transform your weak-subject priority analysis into a day-by-day exam schedule. Study hours are automatically weighted towards high-priority subjects and upcoming exam dates.
                        </p>
                        <div>
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => setActiveTab("timetable")}
                            rightIcon={<ArrowRight size={16} />}
                          >
                            Configure Exam Dates &amp; Generate Timetable
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: DYNAMIC EXAM TIMETABLE SOLVER */}
          {activeTab === "timetable" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Configuration Form with 3D Temporal Matrix */}
              <Card elevated>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <CardTitle>Exam Dates &amp; Study Schedule Parameters</CardTitle>
                      <CardDescription>
                        Configure exam dates for enrolled subjects and your daily available study blocks.
                      </CardDescription>
                    </div>
                    <div style={{ width: 100, height: 60 }}>
                      <TemporalMatrix3D height={60} examCount={examDates.length || 3} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid-2" style={{ gap: 24, marginBottom: 20 }}>
                    {/* Exam Dates Picker */}
                    <div>
                      <label className="form-label" style={{ display: "block", marginBottom: 8 }}>
                        Subject Examination Dates
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {examDates.map((ed, i) => {
                          const examDateObj = ed.exam_date ? new Date(ed.exam_date) : null;
                          const daysLeft = examDateObj
                            ? Math.ceil((examDateObj.getTime() - Date.now()) / (1000 * 3600 * 24))
                            : null;

                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                                padding: "8px 12px",
                                background: "var(--surface-subtle)",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--line)",
                                flexWrap: "wrap",
                              }}
                            >
                              <input
                                aria-label={`Exam subject ${i + 1}`}
                                className="form-input"
                                list="academic-subjects"
                                value={ed.subject_name}
                                onChange={(e) => setExamDates((current) => current.map((exam, index) => index === i ? { ...exam, subject_name: e.target.value } : exam))}
                                placeholder="Subject name"
                                style={{ flex: 1, minWidth: 140, padding: "6px 10px", fontSize: "0.85rem" }}
                              />
                              <input
                                type="date"
                                aria-label={`Exam date for ${ed.subject_name || `entry ${i + 1}`}`}
                                className="form-input"
                                value={ed.exam_date}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => setExamDates((current) => current.map((exam, index) => index === i ? { ...exam, exam_date: e.target.value } : exam))}
                                style={{ width: 150, padding: "6px 10px", fontSize: "0.85rem" }}
                              />
                              {daysLeft !== null && (
                                <Badge variant={daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "amber" : "emerald"}>
                                  {daysLeft > 0 ? `${daysLeft}d left` : "Today"}
                                </Badge>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                aria-label={`Remove ${ed.subject_name || "exam"}`}
                                onClick={() => setExamDates((current) => current.filter((_, index) => index !== i))}
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          );
                        })}
                        <datalist id="academic-subjects">
                          {subjects.map((subject) => <option key={subject.code || subject.name} value={subject.name} />)}
                        </datalist>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setExamDates((current) => [...current, { subject_name: subjects[0]?.name || "", exam_date: "" }])}
                          leftIcon={<Plus size={15} />}
                        >
                          Add Examination Date
                        </Button>
                      </div>
                    </div>

                    {/* Schedule Constraints */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <Input
                        label="Available Study Hours / Day"
                        type="number"
                        min={1}
                        max={12}
                        value={availableDailyHours}
                        onChange={(e) => setAvailableDailyHours(Number(e.target.value))}
                        hint="Balanced allocation avoiding excessive burnout"
                      />

                      <div className="grid-2">
                        <Input
                          label="Preferred Start Time"
                          type="time"
                          value={preferredStartTime}
                          onChange={(e) => setPreferredStartTime(e.target.value)}
                        />

                        <Select
                          label="Study Block Duration"
                          value={blockDuration}
                          onChange={(e) => setBlockDuration(Number(e.target.value))}
                        >
                          <option value={45}>45 mins (Pomodoro Focus)</option>
                          <option value={60}>60 mins (Standard Block)</option>
                          <option value={90}>90 mins (Deep Work)</option>
                        </Select>
                      </div>

                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={includeWeekends}
                          onChange={(e) => setIncludeWeekends(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
                        />
                        Include Weekends in Study Schedule
                      </label>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={handleGenerateTimetable}
                      isLoading={generatingTT}
                      leftIcon={<Calendar size={18} />}
                    >
                      Solve &amp; Generate Timetable
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Timetable Schedule View */}
              {timetable && (
                <Card elevated>
                  <CardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <CardTitle>{timetable.title}</CardTitle>
                        <CardDescription>{timetable.strategy_notes}</CardDescription>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => window.print()} leftIcon={<Printer size={15} />}>
                        Print Schedule
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {timetable.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            borderRadius: "var(--radius-sm)",
                            background: idx % 2 === 0 ? "var(--surface)" : "var(--surface-subtle)",
                            border: "1px solid var(--line-subtle)",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ padding: "6px 10px", borderRadius: "var(--radius-xs)", background: "var(--primary-subtle)", color: "var(--primary)", fontWeight: 700, fontSize: "0.82rem" }}>
                              {item.study_date}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.subject_name}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)" }}>
                                {item.activity}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                              <Clock size={15} /> {item.start_time} &ndash; {item.end_time}
                            </div>
                            <PriorityBadge priority={item.priority} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
