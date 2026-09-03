"use client";

import Link from "next/link";
import { useState } from "react";
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

export default function HomePage() {
  const [demoIA, setDemoIA] = useState(68);
  const [demoAttendance, setDemoAttendance] = useState(78);

  // Interactive Live Preview Calculations (for visual demonstration on landing page)
  const predictedCGPA = Math.min(10, Math.max(4.0, (demoIA * 0.05 + demoAttendance * 0.02 + 3.8))).toFixed(2);
  const riskLabel = demoIA < 50 || demoAttendance < 70 ? "High Risk" : demoIA < 65 || demoAttendance < 75 ? "Moderate Risk" : "Low Risk";
  const riskVariant = riskLabel === "Low Risk" ? "emerald" : riskLabel === "Moderate Risk" ? "amber" : "danger";

  return (
    <div className="page-shell" style={{ background: "var(--canvas)" }}>
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
        {/* HERO SECTION */}
        <section className="section" style={{ paddingTop: 70, paddingBottom: 90 }}>
          <div className="container grid-2" style={{ alignItems: "center", gap: 48 }}>
            <div>
              <div className="eyebrow">
                <Sparkles size={14} /> Precision Academic & Career Intelligence
              </div>
              <h1 className="display-title" style={{ marginTop: 8, marginBottom: 20 }}>
                Understand your academics. <br />
                <span style={{ color: "var(--primary)" }}>Predict your future.</span>
              </h1>
              <p className="lead-text" style={{ marginBottom: 32 }}>
                Gradient AI combines internal assessment trajectory regression, machine-learning CGPA forecasting, weak-subject diagnosis, exam timetable generation, and placement readiness in a unified university workspace.
              </p>

              <div className="gradient-card card-pad" style={{ background: "var(--surface)", maxWidth: 520 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
                  Sign in or Launch Instant Demo
                </div>
                <GoogleSignIn />
              </div>
            </div>

            {/* Hero Interactive Capability Snapshot */}
            <div className="gradient-card-elevated card-pad-lg" style={{ background: "var(--surface)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="brand-logo-icon" style={{ width: 22, height: 22, fontSize: "0.75rem" }}>G</div>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Intelligence Live Engine</span>
                </div>
                <Badge variant={riskVariant}>{riskLabel}</Badge>
              </div>

              {/* Interactive Demo Sliders */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
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
                    style={{ width: "100%", accentColor: "var(--primary)" }}
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
                    style={{ width: "100%", accentColor: "var(--primary)" }}
                  />
                </div>
              </div>

              {/* Real-time Output Metric Cards */}
              <div className="grid-2" style={{ gap: 14 }}>
                <div style={{ padding: "14px 16px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                    Predicted Final CGPA
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--ink)", marginTop: 4 }}>
                    {predictedCGPA} <span style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)" }}>/ 10</span>
                  </div>
                </div>

                <div style={{ padding: "14px 16px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                    Academic Trajectory
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--primary)", marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <TrendingUp size={18} /> {demoIA >= 70 ? "+0.042 / term" : "-0.028 / term"}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--ink-secondary)" }}>
                <span>Real-time Scikit-Learn Model Inference</span>
                <Link href="/dashboard" style={{ color: "var(--primary)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Open Full Analysis <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT GRADIENT AI */}
        <section id="about" className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 48px" }}>
              <div className="eyebrow"><BookOpen size={14} /> About The Platform</div>
              <h2 className="section-title">Built for University Students Who Care About Trajectory</h2>
              <p className="lead-text" style={{ margin: "0 auto" }}>
                Traditional student management systems are static databases. Gradient AI is an intelligent analytics copilot designed to help students discover risks before exams and prepare for Tier-1 placements early.
              </p>
            </div>

            <div className="grid-3">
              <Card elevated>
                <CardContent style={{ padding: 28 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--primary-subtle)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <LineChartIcon size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>Mathematical IA Progression</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Calculates linear regression slopes across internal assessments (IA1, IA2, IA3, IA4+) to detect fluctuations and declining subject performance early.
                  </p>
                </CardContent>
              </Card>

              <Card elevated>
                <CardContent style={{ padding: 28 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--teal-subtle)", color: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Cpu size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>Trained ML Inference</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Connects directly to trained regression and classifier models for honest CGPA forecasting, academic risk evaluation, and placement probability scoring.
                  </p>
                </CardContent>
              </Card>

              <Card elevated>
                <CardContent style={{ padding: 28 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--amber-subtle)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <CalendarDays size={22} />
                  </div>
                  <CardTitle style={{ marginBottom: 8 }}>Actionable Exam Timetable</CardTitle>
                  <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                    Generates balanced study schedules weighted by subject weakness scores and exam proximity, giving you a concrete revision plan.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* WHAT GRADIENT AI DOES: 4-STEP PIPELINE */}
        <section className="section">
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
              ].map((item) => (
                <div key={item.step} className="gradient-card card-pad" style={{ position: "relative" }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", opacity: 0.4, marginBottom: 8 }}>
                    {item.step}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "var(--primary)" }}>{item.icon}</span>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{item.title}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.55 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACADEMIC INTELLIGENCE DEEP DIVE */}
        <section id="academic" className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
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
            <div className="gradient-card-elevated card-pad-lg">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Subject Priority & IA Trajectory</h3>
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
            </div>
          </div>
        </section>

        {/* CAREER INTELLIGENCE DEEP DIVE (YEAR 3 & 4) */}
        <section id="career" className="section">
          <div className="container grid-2" style={{ alignItems: "center", gap: 48 }}>
            {/* Career Preview Card */}
            <div className="gradient-card-elevated card-pad-lg">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Placement Readiness Radar</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-tertiary)" }}>Target Role: Full Stack Software Engineer</span>
                </div>
                <Badge variant="year">Year 3 & 4</Badge>
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
            </div>

            <div>
              <div className="eyebrow"><Briefcase size={14} /> Career & Placement Intelligence</div>
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
        </section>

        {/* YEAR-AWARE MATRIX */}
        <section id="year-matrix" className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
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
              <div className="gradient-card card-pad-lg" style={{ borderTop: "4px solid var(--teal)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>Year 1 & Year 2</h3>
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
                      <CheckCircle2 size={16} color="var(--teal)" /> {item}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: "12px 14px", background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--ink-tertiary)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Lock size={14} /> Placement APIs are locked server-side until Year 3.
                </div>
              </div>

              {/* Year 3 & 4 Card */}
              <div className="gradient-card card-pad-lg" style={{ borderTop: "4px solid var(--primary)", background: "var(--surface-raised)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>Year 3 & Year 4</h3>
                  <Badge variant="emerald">Academic + Career Intelligence</Badge>
                </div>
                <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", marginBottom: 20 }}>
                  Full access to every academic capability plus the comprehensive career intelligence engine.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    "Everything in Year 1 & 2",
                    "First-Class Portfolio Manager (Projects/Internships)",
                    "Certifications & Completed Courses",
                    "20-Question Aptitude Assessment",
                    "Safe Static Coding Review Assessment",
                    "15-Question Communication Assessment",
                    "Placement Probability & Expected LPA Model",
                    "Company Preparation Roadmaps (Google, Amazon, Meta, etc.)",
                    "Consolidated Placement Intelligence PDF Reports",
                  ].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", color: "var(--ink)" }}>
                      <CheckCircle2 size={16} color="var(--primary)" /> {item}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: "12px 14px", background: "var(--primary-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={14} /> Complete Dual-Intelligence Suite Unlocked.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY GRADIENT AI: TRUST & SECURITY */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
              <div className="eyebrow"><ShieldCheck size={14} /> Engineering Principles</div>
              <h2 className="section-title">Built with Transparency & Security</h2>
            </div>

            <div className="grid-3">
              <div className="gradient-card card-pad">
                <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700 }}>Safe Static Code Review</h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                  We evaluate code structure, loops, return boundaries, and algorithmic patterns safely via static analysis without executing untrusted arbitrary student code on the API server.
                </p>
              </div>

              <div className="gradient-card card-pad">
                <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700 }}>Data Honesty</h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                  Our models clearly distinguish prototype development data from verified historical data. We never make unsubstantiated hiring claims or fabricate guarantees.
                </p>
              </div>

              <div className="gradient-card card-pad">
                <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700 }}>Server-Generated Reports</h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                  Download professional ReportLab PDF summaries of your academic progress or placement readiness with one click for faculty review, mentors, or parents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="section" style={{ background: "var(--surface-dark)", color: "#ffffff", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, margin: "0 0 16px", color: "#ffffff" }}>
              Take Control of Your University Trajectory
            </h2>
            <p style={{ fontSize: "1.1rem", color: "#a1b5ae", marginBottom: 32, lineHeight: 1.6 }}>
              Join Gradient AI today to calculate your IA progression, predict your final CGPA, organize your exam preparation, and get placement ready.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "40px 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="brand-logo-icon" style={{ width: 22, height: 22, fontSize: "0.75rem" }}>G</div>
            <span style={{ fontWeight: 800, color: "var(--ink)" }}>Gradient AI</span>
            <span style={{ color: "var(--ink-tertiary)" }}>— Precision Student Intelligence</span>
          </div>

          <div>
            Year 1 & 2: Academic Intelligence &bull; Year 3 & 4: Academic + Career Intelligence
          </div>

          <div style={{ color: "var(--ink-tertiary)", fontSize: "0.8rem" }}>
            &copy; {new Date().getFullYear()} Gradient AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
