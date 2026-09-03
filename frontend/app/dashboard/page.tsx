"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Code2,
  FileText,
  GraduationCap,
  Layers,
  LineChart as LineChartIcon,
  Lock,
  Plus,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, RiskBadge, PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusMessage } from "@/components/ui/status-message";
import { useAuth } from "@/hooks/use-auth";
import {
  getAcademicAnalysis,
  getFeatureAccess,
  getPlacementProfile,
  listAcademicRecords,
  predictAcademic,
  predictPlacement,
} from "@/services/gradient-api";
import type {
  AcademicAnalysis,
  AcademicPredictionResult,
  FeatureAccess,
  PlacementPredictionResult,
  PlacementProfile,
} from "@/types/api";

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth();
  const [features, setFeatures] = useState<FeatureAccess | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Data states
  const [latestRecord, setLatestRecord] = useState<{ id: string; semester: number; previous_cgpa: number; attendance_percentage: number } | null>(null);
  const [academicAnalysis, setAcademicAnalysis] = useState<AcademicAnalysis | null>(null);
  const [academicPrediction, setAcademicPrediction] = useState<AcademicPredictionResult | null>(null);
  const [placementProfile, setPlacementProfile] = useState<PlacementProfile | null>(null);
  const [placementPrediction, setPlacementPrediction] = useState<PlacementPredictionResult | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!session?.profile) {
        setLoadingData(false);
        return;
      }

      try {
        const feat = await getFeatureAccess().catch(() => null);
        setFeatures(feat);

        // Load academic data
        const records = await listAcademicRecords().catch(() => []);
        if (records && records.length > 0) {
          const first = records[0];
          setLatestRecord(first);
          const analysis = await getAcademicAnalysis(first.id).catch(() => null);
          setAcademicAnalysis(analysis);
          const pred = await predictAcademic(first.id).catch(() => null);
          setAcademicPrediction(pred);
        }

        // Load placement data if Year 3/4
        if (session.profile.academic_year >= 3) {
          const pProfile = await getPlacementProfile().catch(() => null);
          setPlacementProfile(pProfile);
          if (pProfile) {
            const pPred = await predictPlacement().catch(() => null);
            setPlacementPrediction(pPred);
          }
        }
      } catch {
        // handled via null states
      } finally {
        setLoadingData(false);
      }
    }

    loadDashboardData();
  }, [session]);

  if (authLoading) {
    return (
      <div className="page-shell">
        <AppNav />
        <main className="section">
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Skeleton height={40} width={280} />
            <Skeleton height={140} />
            <div className="grid-3">
              <Skeleton height={130} />
              <Skeleton height={130} />
              <Skeleton height={130} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="page-shell">
        <AppNav />
        <main className="section">
          <div className="container-narrow">
            <Card elevated>
              <CardContent style={{ padding: 40, textAlign: "center" }}>
                <div className="brand-logo-icon" style={{ width: 44, height: 44, margin: "0 auto 16px", fontSize: "1.2rem" }}>
                  G
                </div>
                <h1 className="section-title">Sign In to Gradient AI</h1>
                <p className="lead-text" style={{ margin: "0 auto 28px" }}>
                  Access your personalized academic trajectory, IA progression charts, and career readiness portal.
                </p>
                <div style={{ maxWidth: 420, margin: "0 auto" }}>
                  <GoogleSignIn />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Needs onboarding
  if (!session.profile) {
    return (
      <div className="page-shell">
        <AppNav />
        <main className="section">
          <div className="container-narrow">
            <Card elevated>
              <CardContent style={{ padding: 40, textAlign: "center" }}>
                <div className="eyebrow"><Sparkles size={14} /> Profile Required</div>
                <h1 className="section-title">Welcome to Gradient AI</h1>
                <p className="lead-text" style={{ margin: "0 auto 24px" }}>
                  Complete your short onboarding setup to unlock your personalized academic trajectory and exam timetables.
                </p>
                <Link href="/onboarding" className="btn btn-primary btn-lg">
                  Complete Onboarding Setup <ArrowRight size={18} />
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const profile = session.profile;
  const isSenior = profile.academic_year >= 3;

  return (
    <div className="page-shell">
      <AppNav />

      <main className="section-sm">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Welcome Banner */}
          <div
            className="gradient-card card-pad"
            style={{
              background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-subtle) 100%)",
              borderLeft: "5px solid var(--primary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>
                  Welcome back, {profile.full_name}
                </h1>
                <Badge variant="year">Year {profile.academic_year}</Badge>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--ink-secondary)" }}>
                {profile.college} &bull; {profile.department} &bull; Semester {profile.semester}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/academic" className="btn btn-primary btn-sm">
                <Plus size={15} /> Log IA Marks
              </Link>
              {isSenior && (
                <Link href="/placement" className="btn btn-secondary btn-sm">
                  <Briefcase size={15} /> Placement Hub
                </Link>
              )}
              <Link href="/reports" className="btn btn-secondary btn-sm">
                <FileText size={15} /> Reports
              </Link>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid-4">
            <MetricCard
              title="Prior CGPA"
              value={latestRecord?.previous_cgpa ? latestRecord.previous_cgpa.toFixed(2) : "—"}
              subValue="/ 10"
              icon={<GraduationCap size={20} />}
            />

            <MetricCard
              title="Predicted CGPA"
              value={academicPrediction?.predicted_cgpa ? academicPrediction.predicted_cgpa.toFixed(2) : "—"}
              subValue="ML Forecast"
              trend={academicAnalysis?.overall_trend === "improving" ? "improving" : academicAnalysis?.overall_trend === "declining" ? "declining" : "stable"}
              trendLabel={academicAnalysis?.overall_trend ? `${academicAnalysis.overall_trend.toUpperCase()}` : undefined}
              icon={<Sparkles size={20} />}
            />

            <MetricCard
              title="Academic Risk"
              value={academicPrediction?.risk_level ? academicPrediction.risk_level.replace(" Risk", "") : "Low"}
              badge={<RiskBadge risk={academicPrediction?.risk_level || "Low Risk"} />}
            />

            <MetricCard
              title="Attendance Rate"
              value={latestRecord?.attendance_percentage ? `${latestRecord.attendance_percentage}%` : "—"}
              subValue={latestRecord && latestRecord.attendance_percentage < 75 ? "Below 75% limit" : "Safe"}
              badge={
                latestRecord && latestRecord.attendance_percentage < 75 ? (
                  <Badge variant="danger">Attention</Badge>
                ) : (
                  <Badge variant="emerald">Compliant</Badge>
                )
              }
            />
          </div>

          {/* Main Dashboard Layout: Academic Summary + Action Hub */}
          <div className="grid-2-1">
            {/* Left Column: Academic Diagnostic Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Academic Overview Card */}
              <Card>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CardTitle>Academic Diagnostic & IA Summary</CardTitle>
                      <CardDescription>
                        Internal assessment trajectories and weak subject detection
                      </CardDescription>
                    </div>
                    <Link href="/academic" className="btn btn-outline btn-sm">
                      Manage Subjects <ArrowRight size={14} />
                    </Link>
                  </div>
                </CardHeader>

                <CardContent>
                  {!latestRecord ? (
                    <EmptyState
                      icon={<BookOpen size={30} color="var(--primary)" />}
                      title="No Academic Records Added Yet"
                      description="Enter your subject details and internal assessment (IA) marks to generate regression trends and CGPA forecasts."
                      action={
                        <Link href="/academic" className="btn btn-primary btn-sm">
                          Add Semester Subjects & IA Marks
                        </Link>
                      }
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {/* Weakest Subject Callout */}
                      {academicAnalysis?.weakest_subject && (
                        <div
                          style={{
                            padding: "16px",
                            borderRadius: "var(--radius-sm)",
                            background: "var(--danger-subtle)",
                            border: "1px solid rgba(184, 51, 44, 0.2)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <AlertCircle size={20} color="var(--danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--danger)" }}>
                                Highest Priority: {academicAnalysis.weakest_subject}
                              </span>
                              <PriorityBadge priority="High" />
                            </div>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink)", lineHeight: 1.5 }}>
                              {academicAnalysis.recommendations?.[0] || "Requires targeted concept revision before upcoming exams."}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Subject Quick Breakdown */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "var(--ink-tertiary)" }}>
                          Enrolled Subjects Performance
                        </div>
                        {academicAnalysis?.subjects?.map((sub) => (
                          <div
                            key={sub.subject}
                            style={{
                              padding: "12px 14px",
                              borderRadius: "var(--radius-sm)",
                              background: "var(--surface-subtle)",
                              border: "1px solid var(--line)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{sub.subject}</div>
                              <div style={{ fontSize: "0.78rem", color: "var(--ink-tertiary)" }}>
                                IA Avg: {sub.average_percentage}% &bull; Latest: {sub.latest_percentage}% &bull; Attendance: {sub.attendance_percentage ?? "—"}%
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Career Intelligence Summary (Year 3 & 4 only) */}
              {isSenior && (
                <Card>
                  <CardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <CardTitle>Career & Placement Intelligence</CardTitle>
                        <CardDescription>
                          Placement probability, readiness dimensions, and target company roadmaps
                        </CardDescription>
                      </div>
                      <Link href="/placement" className="btn btn-outline btn-sm">
                        Open Placement Hub <ArrowRight size={14} />
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {!placementProfile ? (
                      <EmptyState
                        icon={<Briefcase size={30} color="var(--primary)" />}
                        title="Placement Profile Not Initialized"
                        description="Set up your target role, programming skills, and take your initial Aptitude & Coding assessments."
                        action={
                          <Link href="/placement" className="btn btn-primary btn-sm">
                            Initialize Placement Profile
                          </Link>
                        }
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div className="grid-2">
                          <div style={{ padding: 14, background: "var(--primary-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(18, 99, 78, 0.2)" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase" }}>
                              Placement Probability
                            </div>
                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                              {placementPrediction ? `${Math.round(placementPrediction.placement_probability * 100)}%` : "—"}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", marginTop: 2 }}>
                              {placementPrediction?.predicted_status || "Evaluating readiness metrics"}
                            </div>
                          </div>

                          <div style={{ padding: 14, background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>
                              Expected Package
                            </div>
                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
                              {placementPrediction?.expected_lpa ? `${placementPrediction.expected_lpa} LPA` : "—"}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", marginTop: 2 }}>
                              ML Prototype Regression
                            </div>
                          </div>
                        </div>

                        {/* Assessment Scores Bar */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <ProgressBar
                            label="Aptitude Assessment"
                            value={placementProfile.aptitude_score || 0}
                          />
                          <ProgressBar
                            label="Coding Assessment"
                            value={placementProfile.coding_score || 0}
                          />
                          <ProgressBar
                            label="Communication Assessment"
                            value={placementProfile.communication_score || 0}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Year 1 & 2 Explanatory Milestone Card */}
              {!isSenior && (
                <div
                  className="gradient-card card-pad"
                  style={{
                    background: "var(--surface-subtle)",
                    border: "1px dashed var(--line-strong)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Lock size={18} color="var(--ink-tertiary)" />
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                      Placement Intelligence Unlocks in Year 3
                    </h3>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                    As a Year {profile.academic_year} student, maximizing your CGPA and resolving weak subjects is your primary objective. Placement assessments, company preparation roadmaps, and resume portfolio tracking will automatically unlock when you enter Year 3.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Quick Action Hub & Exam Timetable Launcher */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Quick Action Hub */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Actions</CardTitle>
                </CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link
                    href="/academic"
                    className="btn btn-secondary"
                    style={{ justifyContent: "flex-start", padding: "12px 14px", width: "100%" }}
                  >
                    <BarChart3 size={18} color="var(--primary)" />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Update IA Scores</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)" }}>Recalculate regression slope</div>
                    </div>
                  </Link>

                  <Link
                    href="/academic"
                    className="btn btn-secondary"
                    style={{ justifyContent: "flex-start", padding: "12px 14px", width: "100%" }}
                  >
                    <CalendarDays size={18} color="var(--teal)" />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Generate Exam Timetable</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)" }}>Solver weighted by weak subjects</div>
                    </div>
                  </Link>

                  {isSenior && (
                    <Link
                      href="/placement"
                      className="btn btn-secondary"
                      style={{ justifyContent: "flex-start", padding: "12px 14px", width: "100%" }}
                    >
                      <Target size={18} color="var(--amber)" />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Take Placement Assessments</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)" }}>Aptitude, Coding, Communication</div>
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/reports"
                    className="btn btn-secondary"
                    style={{ justifyContent: "flex-start", padding: "12px 14px", width: "100%" }}
                  >
                    <FileText size={18} color="var(--indigo)" />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>Download PDF Report</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)" }}>Instant server-generated report</div>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              {/* Data & Modeling Disclaimer Card */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  fontSize: "0.8rem",
                  color: "var(--ink-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
                  Prototype ML Model Note
                </div>
                Forecasts are generated by local scikit-learn Ridge & Logistic Regression artifacts trained on synthetic prototype distributions for development and integration.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
