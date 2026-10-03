"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  User,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { StatusMessage } from "@/components/ui/status-message";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageTransition, GlowingCard } from "@/components/motion/motion-primitives";
import { getProfile, saveStudentProfile, type StudentProfilePayload } from "@/services/gradient-api";
import { useAuth } from "@/hooks/use-auth";

// Dynamically load 3D Progression Constellation
const ProgressionConstellation3D = dynamic(() => import("@/components/3d/progression-constellation-3d"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ width: 120, height: 80, borderRadius: "var(--radius-md)" }} />,
});

export default function OnboardingPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<StudentProfilePayload>({
    full_name: "",
    college: "Gradient Institute of Technology",
    department: "Computer Science & Engineering",
    academic_year: 1,
    semester: 2,
    section: "A",
  });

  useEffect(() => {
    if (session?.user?.display_name && !form.full_name) {
      setForm((prev) => ({ ...prev, full_name: session.user.display_name || "" }));
    }
  }, [session]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim() || !form.college.trim() || !form.department.trim()) {
      setError("Please fill in all required profile fields.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveStudentProfile(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete onboarding.");
    } finally {
      setSaving(false);
    }
  }

  const isSeniorYear = form.academic_year >= 3;

  return (
    <PageTransition className="page-shell">
      <AppNav />

      <main className="section-sm" style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div className="container-narrow">
          {/* Header with 3D Constellation Nexus */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="eyebrow">
                <Sparkles size={14} /> Student Profile Nexus Setup
              </div>
              <h1 className="section-title" style={{ margin: "4px 0 8px" }}>
                Personalize Your Workspace
              </h1>
              <p className="lead-text" style={{ margin: 0, fontSize: "0.95rem" }}>
                Gradient AI unlocks analytical features and career assessments tailored to your university standing.
              </p>
            </div>
            <div style={{ width: 130, height: 90 }}>
              <ProgressionConstellation3D height={90} currentStep={step} academicYear={form.academic_year} />
            </div>
          </div>

          {/* Progress Step Indicator */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 28 }} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={2}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: step >= 1 ? "var(--primary)" : "var(--surface-subtle)",
                  color: step >= 1 ? "#fff" : "var(--ink-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                1
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: step === 1 ? 700 : 500, color: step === 1 ? "var(--ink)" : "var(--ink-tertiary)" }}>
                Institution &amp; Identity
              </span>
            </div>

            <div style={{ width: 44, height: 2, background: step >= 2 ? "var(--primary)" : "var(--line)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: step >= 2 ? "var(--primary)" : "var(--surface-subtle)",
                  color: step >= 2 ? "#fff" : "var(--ink-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                2
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: step === 2 ? 700 : 500, color: step === 2 ? "var(--ink)" : "var(--ink-tertiary)" }}>
                Academic Standing &amp; Access
              </span>
            </div>
          </div>

          <Card elevated>
            <CardHeader>
              <CardTitle>
                {step === 1 ? "Step 1: Your University Details" : "Step 2: Academic Year & Standing"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Enter your name, university, and department to personalize reports and recommendations."
                  : "Your academic year determines whether Placement Intelligence is active."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit}>
                {error && (
                  <div style={{ marginBottom: 20 }}>
                    <StatusMessage kind="error">{error}</StatusMessage>
                  </div>
                )}

                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <Input
                      label="Full Name"
                      placeholder="e.g. Alex Chen"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      leftIcon={<User size={16} />}
                      required
                    />

                    <Input
                      label="University / College"
                      placeholder="e.g. Gradient Institute of Technology"
                      value={form.college}
                      onChange={(e) => setForm({ ...form, college: e.target.value })}
                      leftIcon={<Building size={16} />}
                      required
                    />

                    <div className="grid-2">
                      <Input
                        label="Department / Branch"
                        placeholder="e.g. Computer Science & Engineering"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        leftIcon={<GraduationCap size={16} />}
                        required
                      />

                      <Input
                        label="Section / Cohort"
                        placeholder="e.g. A"
                        value={form.section || ""}
                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        rightIcon={<ArrowRight size={16} />}
                      >
                        Continue to Academic Standing
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label className="form-label" style={{ display: "block", marginBottom: 10 }}>
                        Select Your Academic Year
                      </label>
                      <div className="grid-4" style={{ gap: 12 }} role="radiogroup" aria-label="Academic Year">
                        {[1, 2, 3, 4].map((yr) => {
                          const isSelected = form.academic_year === yr;
                          return (
                            <button
                              key={yr}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() => {
                                const newSemester = yr === 1 ? 2 : yr === 2 ? 4 : yr === 3 ? 6 : 8;
                                setForm({ ...form, academic_year: yr, semester: newSemester });
                              }}
                              style={{
                                padding: "16px 12px",
                                borderRadius: "var(--radius-md)",
                                border: isSelected ? "2px solid var(--primary)" : "1px solid var(--line)",
                                background: isSelected ? "var(--primary-subtle)" : "var(--surface)",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "all 140ms ease",
                              }}
                            >
                              <div style={{ fontWeight: 800, fontSize: "1.2rem", color: isSelected ? "var(--primary)" : "var(--ink)" }}>
                                Year {yr}
                              </div>
                              <div style={{ fontSize: "0.74rem", color: isSelected ? "var(--primary)" : "var(--ink-tertiary)", marginTop: 4 }}>
                                {yr < 3 ? "Academic Focus" : "Career + Academic"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: 16 }}>
                      <Select
                        label="Current Semester"
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                      >
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </Select>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <span className="form-label">Unlocked System Capabilities</span>
                        <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: isSeniorYear ? "var(--primary)" : "var(--teal)" }}>
                            {isSeniorYear ? "Academic + Placement Suite Active" : "Academic Intelligence Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Year Card */}
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "var(--radius-sm)",
                        background: isSeniorYear ? "var(--primary-subtle)" : "var(--surface-subtle)",
                        border: `1px solid ${isSeniorYear ? "rgba(18, 99, 78, 0.25)" : "var(--line)"}`,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      {isSeniorYear ? (
                        <Briefcase size={22} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                      ) : (
                        <GraduationCap size={22} color="var(--teal)" style={{ marginTop: 2, flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: isSeniorYear ? "var(--primary)" : "var(--ink)", marginBottom: 2 }}>
                          {isSeniorYear ? "Year 3 & 4 Career Intelligence Unlocked" : "Year 1 & 2 Academic Intelligence Mode"}
                        </div>
                        <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                          {isSeniorYear
                            ? "Full access to Placement assessments, 6-dimension readiness radar, target company preparation hubs, and career dossiers."
                            : "Focused on GPA maximization, internal assessment regression curves, weak-subject diagnosis, and automated exam timetable generation."}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStep(1)}
                        leftIcon={<ArrowLeft size={16} />}
                      >
                        Back
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={saving}
                        rightIcon={<CheckCircle2 size={16} />}
                      >
                        Complete Onboarding &amp; Enter Workspace
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </PageTransition>
  );
}
