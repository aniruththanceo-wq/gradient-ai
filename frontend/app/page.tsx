"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import {
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
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
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

// Dynamically load 3D AI Intelligence Core to optimize initial load & avoid SSR hydration mismatch
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

  return (
    <PageTransition className="page-shell">
      {/* Top Public Header */}
      <header className="app-header">
        <div className="container app-header-inner">
          <div className="brand-link">
            <div className="brand-logo-icon">G</div>
            <span>Gradient AI</span>
          </div>

          <nav className="nav-links">
            <a href="#about" className="nav-link">About</a>
            <a href="#academic" className="nav-link">Academic Intelligence</a>
            <a href="#career" className="nav-link">Career Intelligence</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#year-matrix" className="nav-link">Year Matrix</a>
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
        <section className="section" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div className="container grid-2" style={{ alignItems: "center", gap: 40 }}>
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeInUp} className="eyebrow">
                <Sparkles size={14} /> Precision Academic &amp; Career Intelligence
              </motion.div>
              <motion.h1 variants={fadeInUp} className="display-title" style={{ marginTop: 8, marginBottom: 20 }}>
                Understand your academics. <br />
                <span style={{ color: "var(--primary)" }}>Predict your future.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="lead-text" style={{ marginBottom: 32 }}>
                Gradient AI combines internal assessment trajectory regression, machine-learning CGPA forecasting,
                weak-subject diagnosis, exam timetable generation, and placement readiness in a unified university workspace.
              </motion.p>

              <motion.div variants={fadeInUp} className="gradient-card card-pad" style={{ background: "var(--surface)", maxWidth: 520 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                  Sign in or Launch Instant Demo
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
                    <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Real-time Predictive Simulator</span>
                  </div>
                  <Badge variant={riskVariant}>{riskLabel}</Badge>
                </div>

                {/* Interactive Demo Sliders */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                      <span>Average IA Score</span>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>{demoIA}%</span>
                    </div>
                    <input
                      type="range"
                      min={35}
                      max={100}
                      value={demoIA}
                      onChange={(e) => setDemoIA(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600, marginBottom: 6 }}>
                      <span>Attendance Rate</span>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>{demoAttendance}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={demoAttendance}
                      onChange={(e) => setDemoAttendance(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                  </div>
                </div>

                {/* Real-time Output Metric Cards */}
                <div className="grid-2" style={{ gap: 12 }}>
                  <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                      Predicted Final CGPA
                    </div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>
                      <AnimatedCounter value={predictedCGPA} decimals={2} duration={0.6} />{" "}
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>/ 10</span>
                    </div>
                  </div>

                  <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                      Academic Trajectory
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <TrendingUp size={16} /> {demoIA >= 70 ? "+0.042 / term" : "-0.028 / term"}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
                  <span>Trained Scikit-Learn Model Inference</span>
                  <Link href="/dashboard" style={{ color: "var(--primary)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Open Full Analysis <ChevronRight size={14} />
                  </Link>
                </div>
              </GlowingCard>
            </motion.div>
          </div>
        </section>

        {/* ABOUT GRADIENT AI */}
        <MotionSection id="about" className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
              <div className="eyebrow"><BookOpen size={14} /> About The Platform</div>
              <h2 className="section-title">Built for University Students Who Care About Trajectory</h2>
              <p className="lead-text" style={{ margin: "0 auto" }}>
                Traditional student management systems are static databases. Gradient AI is an intelligent analytics copilot designed to help students discover risks before exams and prepare for Tier-1 placements early.
              </p>
            </div>

            <div className="grid-3">
              <GlowingCard delay={1}>
                <div className="card-pad">
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-subtle)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <LineChartIcon size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>Mathematical IA Progression</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Calculates linear regression slopes across internal assessments (IA1, IA2, IA3, IA4+) to detect fluctuations and declining subject performance early.
                  </p>
                </div>
              </GlowingCard>

              <GlowingCard delay={2}>
                <div className="card-pad">
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--teal-subtle)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Cpu size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>Trained ML Inference</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Connects directly to trained regression and classifier models for honest CGPA forecasting, academic risk evaluation, and placement probability scoring.
                  </p>
                </div>
              </GlowingCard>

              <GlowingCard delay={3}>
                <div className="card-pad">
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--amber-subtle)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <CalendarDays size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>Actionable Exam Timetable</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Generates balanced study schedules weighted by subject weakness scores and exam proximity, giving you a concrete revision plan.
                  </p>
                </div>
              </GlowingCard>
            </div>
          </div>
        </MotionSection>

        {/* 4-STEP INTELLIGENCE PIPELINE */}
        <MotionSection className="section">
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 52px" }}>
              <div className="eyebrow"><Layers size={14} /> Systematic Approach</div>
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
                  text: "Executes model inference for expected CGPA, academic risk category, placement probability, and expected package LPA.",
                  icon: <Cpu size={20} />,
                },
                {
                  step: "04",
                  title: "Tailored Action Plans",
                  text: "Delivers a personalized exam timetable, target company prep roadmap, skill-gap alerts, and downloadable PDF reports.",
                  icon: <Target size={20} />,
                },
              ].map((item, idx) => (
                <GlowingCard key={item.step} delay={idx + 1} className="card-pad" style={{ position: "relative" }}>
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

        {/* ACADEMIC INTELLIGENCE DEEP DIVE */}
        <MotionSection id="academic" className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
          <div className="container grid-2" style={{ alignItems: "center", gap: 48 }}>
            <div>
              <div className="eyebrow"><GraduationCap size={14} /> Core Academic Intelligence</div>
              <h2 className="section-title">Stop Guessing Your Exam Outcome</h2>
              <p className="lead-text" style={{ marginBottom: 24 }}>
                Track every subject dynamically without rigid exam count limitations. Gradient AI supports flexible IA tests (IA1 through IA4+), calculates your mathematical trajectory, and flags subjects needing immediate attention.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Dynamic multi-subject management with per-subject attendance tracking",
                  "Regression-slope trend classification: Improving, Stable, Fluctuating, Declining",
                  "Weak-subject priority index with transparent mathematical explanations",
                  "Attendance-aware risk threshold monitoring below 75% safety line",
                  "Exam timetable solver weighted by weakness score and exam proximity",
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <CheckCircle2 size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <Link href="/academic" className="btn btn-primary">
                  Explore Academic Flow <ArrowRight size={16} />
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
                  Latest IA score declined to 56% (3-exam slope: -0.062). Attendance is at 70%, which is below the 75% institutional safety threshold.
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

        {/* CAREER INTELLIGENCE DEEP DIVE (YEAR 3 & 4) */}
        <MotionSection id="career" className="section">
          <div className="container grid-2" style={{ alignItems: "center", gap: 48 }}>
            {/* Career Preview Card */}
            <GlowingCard className="card-pad-lg">
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
                  <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Expected Package</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ink)", marginTop: 2 }}>9.4 LPA</div>
                </div>
              </div>
            </GlowingCard>

            <div>
              <div className="eyebrow"><Briefcase size={14} /> Career &amp; Placement Intelligence</div>
              <h2 className="section-title">Graduate with Confidence, Not Anxiety</h2>
              <p className="lead-text" style={{ marginBottom: 24 }}>
                For Year 3 and Year 4 students, Gradient AI unlocks full Career Intelligence. Track your projects, internships, certifications, and courses as first-class entities, take timed assessments, and map out Tier-1 interview preparation.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "First-class management for Projects, Internships, Certifications, and Courses",
                  "20-Question Timed Aptitude Assessment across 4 cognitive domains",
                  "Safe Static Coding Assessment with language selection and rubric feedback",
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

        {/* YEAR-AWARE MATRIX */}
        <MotionSection id="year-matrix" className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
              <div className="eyebrow"><ShieldCheck size={14} /> Strict Year-Based Gating</div>
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
                    "Academic Intelligence PDF Reports",
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

        {/* CTA SECTION */}
        <section className="section" style={{ textAlign: "center", background: "radial-gradient(circle, rgba(18, 99, 78, 0.08) 0%, rgba(246, 248, 246, 1) 70%)" }}>
          <div className="container-narrow">
            <h2 className="section-title" style={{ fontSize: "2.4rem", marginBottom: 16 }}>
              Take Control of Your University Trajectory
            </h2>
            <p className="lead-text" style={{ margin: "0 auto 32px" }}>
              Log in with your university Google account or launch an instant demo persona to explore your academic analytics and placement roadmap today.
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
            <span style={{ fontSize: "0.82rem", color: "var(--ink-tertiary)" }}>&mdash; Student Intelligence Platform</span>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--ink-tertiary)" }}>
            &copy; {new Date().getFullYear()} Gradient AI. All rights reserved.
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}
