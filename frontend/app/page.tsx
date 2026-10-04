"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  LineChart as LineChartIcon,
  Lock,
  MessageSquare,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  AnimatedCounter,
  GlowingCard,
  MotionSection,
  PageTransition,
} from "@/components/motion/motion-primitives";
import { emitSpatialEvent } from "@/lib/spatial-events";

// Dynamically load 3D AI Intelligence Core with SSR: false
const AIIntelligenceCore = dynamic(() => import("@/components/3d/ai-intelligence-core"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: 380,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="skeleton" style={{ width: 260, height: 260, borderRadius: "50%" }} />
    </div>
  ),
});

export default function HomePage() {
  const [demoIA, setDemoIA] = useState(68);
  const [demoAttendance, setDemoAttendance] = useState(78);

  // Interactive Live Preview Calculations (for visual demonstration on landing page)
  const predictedCGPA = Math.min(10, Math.max(4.0, demoIA * 0.05 + demoAttendance * 0.02 + 3.8));
  const riskLabel =
    demoIA < 50 || demoAttendance < 70
      ? "High Risk"
      : demoIA < 65 || demoAttendance < 75
      ? "Moderate Risk"
      : "Low Risk";
  const riskVariant = riskLabel === "Low Risk" ? "emerald" : riskLabel === "Moderate Risk" ? "amber" : "danger";

  const handleIAChange = (val: number) => {
    setDemoIA(val);
    const color = val < 50 ? "#b8332c" : val < 65 ? "#c07817" : "#10b981";
    emitSpatialEvent({ type: "energy-pulse", intensity: 0.5, color });
    emitSpatialEvent({ type: "risk-shift", color });
  };

  const handleAttendanceChange = (val: number) => {
    setDemoAttendance(val);
    const color = val < 70 ? "#b8332c" : val < 75 ? "#c07817" : "#10b981";
    emitSpatialEvent({ type: "energy-pulse", intensity: 0.5, color });
    emitSpatialEvent({ type: "risk-shift", color });
  };

  return (
    <PageTransition className="page-shell">
      {/* Top Public Header */}
      <header className="app-header" role="banner">
        <div className="container app-header-inner">
          <div className="brand-link">
            <div className="brand-logo-icon">G</div>
            <span>Gradient AI</span>
          </div>

          <nav className="nav-links" aria-label="Landing page sections">
            <a href="#telemetry" className="nav-link">Intelligence</a>
            <a href="#academic" className="nav-link">Academic Flow</a>
            <a href="#career" className="nav-link">Career Suite</a>
            <a href="#pipeline" className="nav-link">Pipeline</a>
            <a href="#year-matrix" className="nav-link">Year Gating</a>
            <a href="#comparison" className="nav-link">Why Gradient</a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Open Workspace <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION WITH 3D AI INTELLIGENCE CORE */}
        <section className="section" style={{ paddingTop: 56, paddingBottom: 80 }}>
          <div className="container grid-2" style={{ alignItems: "center", gap: 40 }}>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeInUp} className="eyebrow">
                <Sparkles size={14} /> Precision Academic + Career Intelligence Platform
              </motion.div>
              <motion.h1 variants={fadeInUp} className="display-title" style={{ marginTop: 8, marginBottom: 20 }}>
                Understand your academics. <br />
                <span style={{ color: "var(--primary)" }}>Predict your future.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="lead-text" style={{ marginBottom: 32 }}>
                Gradient AI combines internal assessment trajectory regression, machine-learning CGPA forecasting,
                weak-subject diagnosis, exam timetable generation, and placement readiness into one unified university command center.
              </motion.p>

              <motion.div variants={fadeInUp} className="gradient-card card-pad" style={{ background: "var(--surface)", maxWidth: 520 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                  Sign in or Launch Instant Demo Workspace
                </div>
                <GoogleSignIn />
              </motion.div>
            </motion.div>

            {/* Hero 3D AI Core + Interactive Simulation Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* 3D Geometric AI Neural Core */}
              <div
                style={{
                  borderRadius: "var(--radius-lg)",
                  background: "radial-gradient(circle, rgba(18, 99, 78, 0.08) 0%, rgba(255, 255, 255, 0.5) 70%)",
                  border: "1px solid var(--line-subtle)",
                  position: "relative",
                  boxShadow: "var(--shadow-sm)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 18,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--primary)",
                  }}
                >
                  <Cpu size={14} /> AI Intelligence Core
                </div>
                <AIIntelligenceCore height={300} />
              </div>

              {/* Interactive Capability Live Simulation */}
              <GlowingCard className="card-pad" style={{ background: "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="brand-logo-icon" style={{ width: 22, height: 22, fontSize: "0.75rem" }}>G</div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Predictive Trajectory Simulator</span>
                  </div>
                  <Badge variant={riskVariant}>{riskLabel}</Badge>
                </div>

                {/* Interactive Demo Sliders */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                      <span>Average Internal Assessment (IA)</span>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>{demoIA}%</span>
                    </div>
                    <input
                      type="range"
                      min={35}
                      max={100}
                      value={demoIA}
                      onChange={(e) => handleIAChange(Number(e.target.value))}
                      aria-label="Average Internal Assessment"
                      style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                      <span>Attendance Compliance</span>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>{demoAttendance}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={demoAttendance}
                      onChange={(e) => handleAttendanceChange(Number(e.target.value))}
                      aria-label="Attendance Compliance"
                      style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                  </div>
                </div>

                {/* Real-time Output Metric Cards */}
                <div className="grid-2" style={{ gap: 12 }}>
                  <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                      Predicted Semester CGPA
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
                      <AnimatedCounter value={predictedCGPA} decimals={2} duration={0.6} />{" "}
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>/ 10</span>
                    </div>
                  </div>

                  <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                      Trajectory Velocity
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <TrendingUp size={16} /> {demoIA >= 70 ? "+0.042 / term" : "-0.028 / term"}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
                  <span>Interactive prediction demonstration</span>
                  <Link href="/dashboard" style={{ color: "var(--primary)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Open Full Analysis <ChevronRight size={14} />
                  </Link>
                </div>
              </GlowingCard>
            </motion.div>
          </div>
        </section>

        {/* SECTION 1: WHAT GRADIENT AI UNDERSTANDS (TELEMETRY) */}
        <MotionSection id="telemetry" className="section" style={{ background: "rgba(255, 255, 255, 0.72)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 48px" }}>
              <div className="sector-badge">[ SECTOR 01 // TELEMETRY STREAM ]</div>
              <h2 className="section-title">What Gradient AI Understands About Your University Journey</h2>
              <p className="lead-text" style={{ margin: "0 auto" }}>
                Universities collect grades, but rarely interpret them. Gradient AI converts isolated test scores and attendance records into a continuous intelligence stream.
              </p>
            </div>

            <div className="grid-3">
              <GlowingCard delay={1}>
                <div className="card-pad" onMouseEnter={() => emitSpatialEvent({ type: "energy-pulse", intensity: 0.4 })}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-subtle)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <LineChartIcon size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>IA Trajectory Regression</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Evaluates multi-exam linear slopes (IA1, IA2, IA3, IA4+) per subject to distinguish temporary dips from dangerous downward trends before final exams.
                  </p>
                </div>
              </GlowingCard>

              <GlowingCard delay={2}>
                <div className="card-pad" onMouseEnter={() => emitSpatialEvent({ type: "energy-pulse", intensity: 0.4 })}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--teal-subtle)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Activity size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>Attendance Risk Sensitivity</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Tracks per-subject attendance percentages against the critical 75% institutional compliance boundary, predicting detention risk and mark penalties.
                  </p>
                </div>
              </GlowingCard>

              <GlowingCard delay={3}>
                <div className="card-pad" onMouseEnter={() => emitSpatialEvent({ type: "energy-pulse", intensity: 0.4 })}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--amber-subtle)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Target size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>6-Dimension Career Readiness</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Maps Academics, Aptitude, Coding, Communication, Portfolio, and Technical Skills against Tier-1 company hiring rubrics.
                  </p>
                </div>
              </GlowingCard>
            </div>
          </div>
        </MotionSection>

        {/* SECTION 2: ACADEMIC INTELLIGENCE DEEP DIVE */}
        <MotionSection id="academic" className="section">
          <div className="container grid-2" style={{ alignItems: "center", gap: 48 }}>
            <div>
              <div className="sector-badge">[ SECTOR 02 // REGRESSION ENGINE ]</div>
              <h2 className="section-title">Stop Guessing Your Semester Outcome</h2>
              <p className="lead-text" style={{ marginBottom: 24 }}>
                Track every subject dynamically without rigid exam limits. Gradient AI supports flexible IA tests (IA1 through IA4+), calculates mathematical slopes, and automatically builds an exam timetable weighted toward weak subjects.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Dynamic subject entry with per-subject attendance rate tracking",
                  "Regression-slope trend classification: Improving, Stable, Fluctuating, Declining",
                  "Weak-subject priority index with transparent mathematical explanations",
                  "Attendance-aware risk threshold monitoring below 75% safety line",
                  "Dynamic exam timetable solver weighted by weakness and exam proximity",
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <Link href="/academic" className="btn btn-primary">
                  Explore Academic Workspace <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Academic Preview Card */}
            <GlowingCard className="card-pad-lg">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Subject Priority &amp; IA Trajectory</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>Discrete Mathematics (MA201)</span>
                </div>
                <Badge variant="danger">High Priority</Badge>
              </div>

              <div style={{ padding: "14px 16px", borderRadius: "var(--radius-sm)", background: "var(--danger-subtle)", border: "1px solid rgba(184, 51, 44, 0.2)", marginBottom: 18 }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--danger)", marginBottom: 4 }}>
                  Diagnostic Alert
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--ink)", lineHeight: 1.5 }}>
                  Latest IA score declined to 54% (3-exam slope: -0.062). Attendance is at 70%, which is below the 75% institutional safety threshold.
                </div>
              </div>

              <div className="grid-3" style={{ gap: 10, textAlign: "center" }}>
                <div style={{ padding: 10, background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>IA Average</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>62.4%</div>
                </div>
                <div style={{ padding: 10, background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Trend</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--danger)", marginTop: 2 }}>Declining</div>
                </div>
                <div style={{ padding: 10, background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Attendance</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--amber)", marginTop: 2 }}>70.0%</div>
                </div>
              </div>
            </GlowingCard>
          </div>
        </MotionSection>

        {/* SECTION 3: CAREER & PLACEMENT INTELLIGENCE DEEP DIVE (YEAR 3 & 4) */}
        <MotionSection id="career" className="section" style={{ background: "rgba(255, 255, 255, 0.72)", borderTop: "1px solid var(--line)" }}>
          <div className="container grid-2" style={{ alignItems: "center", gap: 48 }}>
            {/* Career Preview Card */}
            <GlowingCard className="card-pad-lg" onMouseEnter={() => emitSpatialEvent({ type: "energy-pulse", intensity: 0.5, color: "#38bdf8" })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Placement Readiness Radar</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>Target Role: Full Stack Software Engineer</span>
                </div>
                <Badge variant="year">Year 3 &amp; 4</Badge>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {[
                  { name: "Academics & CGPA", val: 84 },
                  { name: "Aptitude Assessment", val: 75 },
                  { name: "Coding & DSA", val: 70 },
                  { name: "Communication / Verbal", val: 82 },
                  { name: "Portfolio (Projects & Internships)", val: 78 },
                  { name: "Technical Skills Coverage", val: 80 },
                ].map((dim) => (
                  <div key={dim.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: 4 }}>
                      <span>{dim.name}</span>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>{dim.val}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--surface-subtle)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${dim.val}%`, height: "100%", background: "var(--primary)" }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ gap: 12 }}>
                <div style={{ padding: 12, background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Placement Probability</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>82.5%</div>
                </div>
                <div style={{ padding: 12, background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Expected Package Range</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>8.5 – 11.2 LPA</div>
                </div>
              </div>
            </GlowingCard>

            <div>
              <div className="sector-badge">[ SECTOR 03 // 6D CAPABILITY LATTICE ]</div>
              <h2 className="section-title">Graduate with Confidence, Not Anxiety</h2>
              <p className="lead-text" style={{ marginBottom: 24 }}>
                For Year 3 and Year 4 students, Gradient AI unlocks full Career Intelligence. Track your projects, internships, certifications, and courses as first-class entities, take timed assessments, and map out Tier-1 interview preparation.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "First-class CRUD for Projects, Internships, Certifications, and Courses",
                  "20-Question Timed Aptitude Assessment across 4 cognitive domains",
                  "Safe Static Python Coding Assessment with AST validation and rubric feedback",
                  "15-Question Communication Assessment (Grammar, Vocabulary, Business context)",
                  "Target Company Roadmaps for Google, Amazon, Microsoft, Meta, and OpenAI",
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <Link href="/placement" className="btn btn-primary">
                  Explore Placement Suite <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </MotionSection>

        {/* SECTION 4: 4-STEP INTELLIGENCE PIPELINE */}
        <MotionSection id="pipeline" className="section">
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 52px" }}>
              <div className="sector-badge">[ SECTOR 04 // PIPELINE ARCHITECTURE ]</div>
              <h2 className="section-title">From Raw Marks to Career Mastery</h2>
              <p className="lead-text" style={{ margin: "0 auto" }}>
                A four-step structured intelligence loop turning your semester inputs into actionable study hours and placement milestones.
              </p>
            </div>

            <div className="grid-4">
              {[
                {
                  step: "01",
                  title: "Structured Data Intake",
                  text: "Enter your semester metrics, flexible IA scores per subject, attendance, study consistency, and portfolio artifacts.",
                  icon: <FileSpreadsheet size={20} />,
                },
                {
                  step: "02",
                  title: "Algorithmic Diagnosis",
                  text: "Evaluates score slopes, weakness priority indices, attendance penalties (<75%), and multi-subject stability.",
                  icon: <BarChart3 size={20} />,
                },
                {
                  step: "03",
                  title: "ML Predictive Forecasting",
                  text: "Connects to trained Ridge and Logistic Regression artifacts for CGPA and placement guidance. Salary range is a bounded prototype estimate.",
                  icon: <Cpu size={20} />,
                },
                {
                  step: "04",
                  title: "Tailored Action Plans",
                  text: "Delivers a personalized exam timetable, target company prep roadmap, skill-gap alerts, and downloadable PDF intelligence dossiers.",
                  icon: <Target size={20} />,
                },
              ].map((item, idx) => (
                <GlowingCard key={item.step} delay={idx + 1} className="card-pad" style={{ position: "relative" }} onMouseEnter={() => emitSpatialEvent({ type: "energy-pulse", intensity: 0.35 })}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", opacity: 0.35, marginBottom: 8 }}>
                    {item.step}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "var(--primary)" }}>{item.icon}</span>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{item.title}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                    {item.text}
                  </p>
                </GlowingCard>
              ))}
            </div>
          </div>
        </MotionSection>

        {/* SECTION 5: YEAR-AWARE MATRIX */}
        <MotionSection id="year-matrix" className="section" style={{ background: "rgba(255, 255, 255, 0.72)", borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
              <div className="sector-badge">[ SECTOR 05 // PROGRESSION GATES ]</div>
              <h2 className="section-title">Designed Specifically for Each Stage of University</h2>
              <p className="lead-text" style={{ margin: "0 auto" }}>
                Early years focus on building unbreakable academic fundamentals. Senior years transition into comprehensive placement execution.
              </p>
            </div>

            <div className="grid-2" style={{ gap: 28 }}>
              {/* Year 1 & 2 Card */}
              <GlowingCard className="card-pad-lg" style={{ borderTop: "4px solid var(--teal)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>Year 1 &amp; Year 2</h3>
                  <Badge variant="neutral">Academic Focus</Badge>
                </div>
                <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", marginBottom: 20 }}>
                  Build the academic foundation that keeps all future career doors wide open.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "Academic Profile & Study Consistency",
                    "Dynamic Multi-Subject IA Tracking",
                    "Regression Slope & Fluctuation Detection",
                    "Weak-Subject Priority Analysis",
                    "Attendance Safety Line Monitoring",
                    "ML CGPA & Risk Forecasting",
                    "Automated Exam Timetable Generator",
                    "Academic Intelligence PDF Dossiers",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "var(--ink)" }}>
                      <CheckCircle2 size={16} color="var(--teal)" />
                      <span>{item}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "var(--ink-tertiary)", marginTop: 6 }}>
                    <Lock size={16} />
                    <span>Career &amp; Placement Suite (Unlocks in Year 3)</span>
                  </div>
                </div>
              </GlowingCard>

              {/* Year 3 & 4 Card */}
              <GlowingCard className="card-pad-lg" style={{ borderTop: "4px solid var(--primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>Year 3 &amp; Year 4</h3>
                  <Badge variant="emerald">Full Career Suite</Badge>
                </div>
                <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", marginBottom: 20 }}>
                  Execute Tier-1 company preparation, assessments, and portfolio readiness.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "Everything in Academic Intelligence",
                    "Full Placement Profile & Skill Tagging",
                    "Projects, Internships, Certs & Courses CRUD",
                    "20-Question Timed Aptitude Exam",
                    "Safe Static Rubric Code Evaluation",
                    "15-Question Verbal & Business Communication",
                    "6-Dimension Readiness Radar Chart",
                    "ML Placement Probability & Package Forecaster",
                    "Tier-1 Target Company Strategy Hub",
                    "Official Placement Dossier PDF Reports",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "var(--ink)" }}>
                      <CheckCircle2 size={16} color="var(--primary)" />
                      <span style={{ fontWeight: 600 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </GlowingCard>
            </div>
          </div>
        </MotionSection>

        {/* SECTION 6: WHY GRADIENT AI IS DIFFERENT */}
        <MotionSection id="comparison" className="section">
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 48px" }}>
              <div className="sector-badge">[ SECTOR 06 // PARADIGM ADVANTAGE ]</div>
              <h2 className="section-title">Why Gradient AI is Not Just Another College Portal</h2>
              <p className="lead-text" style={{ margin: "0 auto" }}>
                Traditional university software was built for administrators to record past grades. Gradient AI was built for students to forecast future outcomes.
              </p>
            </div>

            <div className="grid-3">
              <GlowingCard className="card-pad">
                <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 10, color: "var(--ink)" }}>
                  Traditional University ERP
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.7 }}>
                  <li>Static grade report tables</li>
                  <li>Discovers subject failure after end-semester exams</li>
                  <li>Generic unweighted exam timetables</li>
                  <li>Zero career readiness or skill gap insights</li>
                </ul>
              </GlowingCard>

              <GlowingCard className="card-pad" style={{ border: "2px solid var(--primary)", background: "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--primary)" }}>Gradient AI</span>
                  <Badge variant="emerald">Intelligent</Badge>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.7 }}>
                  <li>Live linear regression slopes on internal marks</li>
                  <li>Early warning flags 6 weeks prior to semester finals</li>
                  <li>Automated study timetables weighted by subject weakness</li>
                  <li>6-axis radar matching Tier-1 placement benchmarks</li>
                </ul>
              </GlowingCard>

              <GlowingCard className="card-pad">
                <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 10, color: "var(--ink)" }}>
                  Commercial Test Platforms
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.7 }}>
                  <li>Disconnected from college marks &amp; attendance</li>
                  <li>Unrealistic guaranteed package claims</li>
                  <li>Rigid question dumps without personalized context</li>
                  <li>No integrated academic recovery plans</li>
                </ul>
              </GlowingCard>
            </div>
          </div>
        </MotionSection>

        {/* CTA SECTION */}
        <section className="section" style={{ textAlign: "center", background: "radial-gradient(circle, rgba(18, 99, 78, 0.08) 0%, rgba(246, 248, 246, 1) 70%)" }}>
          <div className="container-narrow">
            <h2 className="section-title" style={{ fontSize: "2.4rem", marginBottom: 16 }}>
              Take Control of Your University Trajectory
            </h2>
            <p className="lead-text" style={{ margin: "0 auto 32px" }}>
              Sign in with your Google account or launch an instant demo persona to explore your academic analytics and placement roadmap today.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Enter Gradient AI Workspace <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--line)", background: "var(--surface)", padding: "32px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="brand-logo-icon" style={{ width: 24, height: 24, fontSize: "0.78rem" }}>G</div>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Gradient AI</span>
            <span style={{ fontSize: "0.82rem", color: "var(--ink-tertiary)" }}>&mdash; Student Academic + Career Intelligence</span>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--ink-tertiary)" }}>
            &copy; {new Date().getFullYear()} Gradient AI. All rights reserved.
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}
