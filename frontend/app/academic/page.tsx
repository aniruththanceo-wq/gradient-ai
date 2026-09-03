"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
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
  const [examDates, setExamDates] = useState<{ subject_name: string; exam_date: string }[]>([
    { subject_name: "Discrete Mathematics", exam_date: "2026-10-15" },
    { subject_name: "Data Structures & Algorithms", exam_date: "2026-10-20" },
    { subject_name: "Computer Organization", exam_date: "2026-10-24" },
  ]);
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
    // re-index
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
      setStatusMessage("Academic record saved successfully. Processing regression analysis and ML forecast...");

      const ana = await getAcademicAnalysis(result.id);
      setAnalysis(ana);

      const pred = await predictAcademic(result.id);
      setPrediction(pred);

      await loadExistingRecords();
      setActiveTab("analytics");
      setStatusMessage(`Analysis complete. Predicted CGPA: ${pred.predicted_cgpa.toFixed(2)} (${pred.risk_level}).`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save academic record.");
    } finally {
      setSaving(false);
    }
  }

  // Generate Timetable Flow
  async function handleGenerateTimetable() {
    if (!activeRecordId) {
      setErrorMessage("Please save your academic records before generating a timetable.");
      return;
    }

    setGeneratingTT(true);
    setErrorMessage(null);
    try {
      const result = await generateTimetable({
        academic_record_id: activeRecordId,
        exam_dates: examDates,
        available_study_hours_per_day: availableDailyHours,
        preferred_start_time: preferredStartTime,
        block_minutes: blockDuration,
        include_weekends: includeWeekends,
      });
      setTimetable(result);
      setActiveTab("timetable");
      setStatusMessage("Personalized study timetable generated based on weak subject priority and exam proximity.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate timetable.");
    } finally {
      setGeneratingTT(false);
    }
  }

  // Generate Academic Report Flow
  async function handleCreateReport() {
    if (!activeRecordId) return;
    setGeneratingReport(true);
    setErrorMessage(null);
    try {
      const rep = await createAcademicReport(activeRecordId);
      setGeneratedReportId(rep.id);
      setStatusMessage("Academic Intelligence PDF report generated successfully — click Download to save.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate PDF report.");
    } finally {
      setGeneratingReport(false);
    }
  }

  // Format Recharts Multi-Subject Trajectory Data
  const chartColors = ["#12634e", "#197278", "#c07817", "#b8332c", "#3b5998", "#7a3e9d"];
  const maxIANumber = Math.max(...subjects.map((s) => s.ia_marks.length), 3);
  const multiSubjectChartData = Array.from({ length: maxIANumber }, (_, i) => {
    const dataPoint: Record<string, any> = { name: `IA ${i + 1}` };
    analysis?.subjects?.forEach((sub) => {
      if (sub.percentages[i] !== undefined) {
        dataPoint[sub.subject] = sub.percentages[i];
      }
    });
    return dataPoint;
  });

  return (
    <div className="page-shell">
      <AppNav />

      <main className="section-sm">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="eyebrow"><GraduationCap size={14} /> Academic Intelligence</div>
              <h1 className="section-title">Academic Analytics & Exam Planning</h1>
              <p className="lead-text" style={{ margin: 0, fontSize: "0.95rem" }}>
                Log flexible internal assessments, track mathematical regression trajectories, and generate weak-subject-aware exam timetables.
              </p>
            </div>

            {activeRecordId && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateReport}
                  isLoading={generatingReport}
                  leftIcon={<Download size={15} />}
                >
                  Generate PDF Report
                </Button>
                {generatedReportId && (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={downloadingReport}
                    leftIcon={<Download size={15} />}
                    onClick={async () => {
                      setDownloadingReport(true);
                      try {
                        await downloadReportPdf(generatedReportId, `academic-report-sem-${semester}.pdf`);
                      } catch (e) {
                        setErrorMessage(e instanceof Error ? e.message : "PDF download failed.");
                      } finally {
                        setDownloadingReport(false);
                      }
                    }}
                  >
                    Download PDF
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <Tabs
            tabs={[
              { id: "records", label: "1. Academic & IA Data Entry", icon: <Layers size={16} /> },
              { id: "analytics", label: "2. IA Trajectories & CGPA Forecast", icon: <LineChartIcon size={16} /> },
              { id: "timetable", label: "3. Exam Timetable Solver", icon: <CalendarDays size={16} /> },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />

          {/* Feedback Messages */}
          {statusMessage && <StatusMessage kind="success">{statusMessage}</StatusMessage>}
          {errorMessage && <StatusMessage kind="error">{errorMessage}</StatusMessage>}

          {/* TAB 1: ACADEMIC & IA DATA ENTRY */}
          {activeTab === "records" && (
            <form onSubmit={handleSubmitRecord} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Semester & Study Habits */}
              <Card elevated>
                <CardHeader>
                  <CardTitle>Academic Standing & Study Habits</CardTitle>
                  <CardDescription>
                    Historical scores, prior CGPA, and weekly study consistency parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid-4" style={{ marginBottom: 18 }}>
                    <Select
                      label="Semester"
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </Select>

                    <Input
                      label="10th Percentage"
                      type="number"
                      step="0.1"
                      min={35}
                      max={100}
                      value={tenth}
                      onChange={(e) => setTenth(Number(e.target.value))}
                      required
                    />

                    <Input
                      label="12th Percentage"
                      type="number"
                      step="0.1"
                      min={35}
                      max={100}
                      value={twelfth}
                      onChange={(e) => setTwelfth(Number(e.target.value))}
                      required
                    />

                    <Input
                      label="Prior CGPA"
                      type="number"
                      step="0.01"
                      min={0}
                      max={10}
                      value={prevCGPA}
                      onChange={(e) => setPrevCGPA(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="grid-4">
                    <Input
                      label="Overall Attendance %"
                      type="number"
                      step="0.5"
                      min={0}
                      max={100}
                      value={attendance}
                      onChange={(e) => setAttendance(Number(e.target.value))}
                      hint="Safety line is 75%"
                      required
                    />

                    <Input
                      label="Weekday Study Hours / Day"
                      type="number"
                      step="0.5"
                      min={0}
                      max={16}
                      value={weekdayHours}
                      onChange={(e) => setWeekdayHours(Number(e.target.value))}
                      required
                    />

                    <Input
                      label="Weekend Study Hours / Day"
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
                      <option value="high">High (Daily Fixed Slots)</option>
                      <option value="consistent">Consistent (Regular Routine)</option>
                      <option value="moderate">Moderate (Before IA / Deadlines)</option>
                      <option value="inconsistent">Inconsistent (Sporadic)</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Subject & Flexible IA Manager */}
              <Card elevated>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <CardTitle>Enrolled Subjects & Flexible IA Marks</CardTitle>
                      <CardDescription>
                        Supports flexible number of IA exams per subject (IA1, IA2, IA3, IA4+).
                      </CardDescription>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={addSubject} leftIcon={<Plus size={15} />}>
                      Add Subject
                    </Button>
                  </div>
                </CardHeader>

                <CardContent style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {subjects.map((subject, sIdx) => (
                    <div
                      key={sIdx}
                      className="gradient-card card-pad"
                      style={{ background: "var(--surface-subtle)", border: "1px solid var(--line)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 800, color: "var(--primary)" }}>#{sIdx + 1}</span>
                          <span style={{ fontWeight: 700, fontSize: "1.05rem" }}>{subject.name || "Unnamed Subject"}</span>
                        </div>
                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubject(sIdx)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--danger)" }}
                            title="Remove subject"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid-3" style={{ marginBottom: 16 }}>
                        <Input
                          label="Subject Name"
                          value={subject.name}
                          onChange={(e) => {
                            const updated = [...subjects];
                            updated[sIdx].name = e.target.value;
                            setSubjects(updated);
                          }}
                          required
                        />

                        <Input
                          label="Subject Code"
                          value={subject.code || ""}
                          onChange={(e) => {
                            const updated = [...subjects];
                            updated[sIdx].code = e.target.value;
                            setSubjects(updated);
                          }}
                        />

                        <Input
                          label="Subject Attendance %"
                          type="number"
                          step="0.5"
                          min={0}
                          max={100}
                          value={subject.attendance_percentage ?? 80}
                          onChange={(e) => {
                            const updated = [...subjects];
                            updated[sIdx].attendance_percentage = Number(e.target.value);
                            setSubjects(updated);
                          }}
                        />
                      </div>

                      {/* IA Marks Rows */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-secondary)", textTransform: "uppercase" }}>
                            Internal Assessments ({subject.ia_marks.length} recorded)
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addIAMark(sIdx)}
                            leftIcon={<Plus size={13} />}
                          >
                            Add IA Exam
                          </Button>
                        </div>

                        <div className="grid-4" style={{ gap: 10 }}>
                          {subject.ia_marks.map((mark, mIdx) => (
                            <div
                              key={mIdx}
                              style={{
                                padding: "10px 12px",
                                background: "var(--surface)",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--line)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>
                                  {mark.title || `IA ${mIdx + 1}`}
                                </span>
                                {subject.ia_marks.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeIAMark(sIdx, mIdx)}
                                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-tertiary)", padding: 2 }}
                                  >
                                    &times;
                                  </button>
                                )}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                  className="form-input"
                                  type="number"
                                  step="0.5"
                                  min={0}
                                  max={mark.max_marks}
                                  value={mark.marks_obtained}
                                  onChange={(e) => {
                                    const updated = [...subjects];
                                    updated[sIdx].ia_marks[mIdx].marks_obtained = Number(e.target.value);
                                    setSubjects(updated);
                                  }}
                                  style={{ padding: "6px 8px", fontSize: "0.85rem" }}
                                  required
                                />
                                <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>/ {mark.max_marks}</span>
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>
                                {Math.round((mark.marks_obtained / mark.max_marks) * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button type="submit" variant="primary" size="lg" isLoading={saving} rightIcon={<Sparkles size={18} />}>
                      Save & Run Intelligence Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* TAB 2: IA TRAJECTORIES & CGPA FORECAST */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {!analysis ? (
                <EmptyState
                  icon={<LineChartIcon size={32} color="var(--primary)" />}
                  title="No Analysis Computed Yet"
                  description="Complete the Academic Data Entry form in Tab 1 to generate regression slopes and ML forecasts."
                  action={
                    <Button variant="primary" onClick={() => setActiveTab("records")}>
                      Go to Data Entry
                    </Button>
                  }
                />
              ) : (
                <>
                  {/* Top Forecast KPI Highlights */}
                  <div className="grid-3">
                    <MetricCard
                      title="Predicted CGPA"
                      value={prediction ? prediction.predicted_cgpa.toFixed(2) : "—"}
                      subValue="/ 10.0"
                      trend={analysis.overall_trend === "improving" ? "improving" : analysis.overall_trend === "declining" ? "declining" : "stable"}
                      trendLabel={`Overall Trajectory: ${analysis.overall_trend.toUpperCase()}`}
                      icon={<Sparkles size={22} />}
                    />

                    <MetricCard
                      title="Academic Risk Level"
                      value={prediction?.risk_level ? prediction.risk_level.replace(" Risk", "") : "Low"}
                      badge={<RiskBadge risk={prediction?.risk_level || "Low Risk"} />}
                      icon={<AlertCircle size={22} />}
                    />

                    <MetricCard
                      title="Average IA Performance"
                      value={`${analysis.average_ia_percentage}%`}
                      subValue={analysis.strongest_subject ? `Strongest: ${analysis.strongest_subject}` : undefined}
                      icon={<BarChart3 size={22} />}
                    />
                  </div>

                  {/* Multi-Subject Trajectory Chart */}
                  <Card elevated>
                    <CardHeader>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <CardTitle>Subject IA Progression Curves</CardTitle>
                          <CardDescription>
                            Linear trajectory and fluctuation tracking across all exams
                          </CardDescription>
                        </div>
                        <Badge variant="emerald">Recharts Active</Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div style={{ width: "100%", height: 320, minHeight: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={multiSubjectChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--line-subtle)" />
                            <XAxis dataKey="name" stroke="var(--ink-secondary)" />
                            <YAxis domain={[0, 100]} stroke="var(--ink-secondary)" tickFormatter={(val) => `${val}%`} />
                            <Tooltip
                              contentStyle={{
                                background: "var(--surface)",
                                border: "1px solid var(--line)",
                                borderRadius: "var(--radius-sm)",
                                boxShadow: "var(--shadow-md)",
                              }}
                              formatter={(value: any) => [`${value}%`]}
                            />
                            <Legend />
                            {analysis.subjects.map((sub, i) => (
                              <Line
                                key={sub.subject}
                                type="monotone"
                                dataKey={sub.subject}
                                stroke={chartColors[i % chartColors.length]}
                                strokeWidth={2.5}
                                activeDot={{ r: 6 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weak-Subject Diagnosis & Actionable Recommendations */}
                  <div className="grid-2">
                    {/* Weak Subject Diagnosis */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Weak-Subject Priority Analysis</CardTitle>
                        <CardDescription>
                          Mathematical weakness scoring considering average, latest mark, slope, and attendance
                        </CardDescription>
                      </CardHeader>

                      <CardContent style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {analysis.subjects.map((sub) => (
                          <div
                            key={sub.subject}
                            style={{
                              padding: "14px 16px",
                              borderRadius: "var(--radius-sm)",
                              background: sub.priority === "High" ? "var(--danger-subtle)" : "var(--surface-subtle)",
                              border: `1px solid ${sub.priority === "High" ? "rgba(184, 51, 44, 0.25)" : "var(--line)"}`,
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{sub.subject}</span>
                              <div style={{ display: "flex", gap: 8 }}>
                                <Badge variant={sub.trend === "improving" ? "emerald" : sub.trend === "declining" ? "danger" : "amber"}>
                                  {sub.trend}
                                </Badge>
                                <PriorityBadge priority={sub.priority} />
                              </div>
                            </div>

                            <div style={{ fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
                              IA Average: <strong>{sub.average_percentage}%</strong> &bull; Latest Exam: <strong>{sub.latest_percentage}%</strong>
                              {sub.attendance_percentage !== null && ` &bull; Attendance: ${sub.attendance_percentage}%`}
                            </div>

                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "var(--ink)" }}>
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
                          <CardTitle>Academic Advisory Recommendations</CardTitle>
                          <CardDescription>
                            Targeted action items derived from your performance patterns
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
                            Configure Exam Dates & Generate Timetable
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: EXAM TIMETABLE SOLVER */}
          {activeTab === "timetable" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Configuration Form */}
              <Card elevated>
                <CardHeader>
                  <CardTitle>Exam Dates & Study Schedule Parameters</CardTitle>
                  <CardDescription>
                    Configure exam dates for enrolled subjects and your daily available study blocks.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid-2" style={{ gap: 24, marginBottom: 20 }}>
                    {/* Exam Dates Picker */}
                    <div>
                      <label className="form-label" style={{ display: "block", marginBottom: 8 }}>
                        Subject Examination Dates
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {examDates.map((ed, i) => (
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
                            }}
                          >
                            <span style={{ flex: 1, fontWeight: 600, fontSize: "0.9rem" }}>{ed.subject_name}</span>
                            <input
                              type="date"
                              className="form-input"
                              value={ed.exam_date}
                              onChange={(e) => {
                                const updated = [...examDates];
                                updated[i].exam_date = e.target.value;
                                setExamDates(updated);
                              }}
                              style={{ width: 160, padding: "6px 10px", fontSize: "0.85rem" }}
                            />
                          </div>
                        ))}
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
                      Solve & Generate Timetable
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
    </div>
  );
}
