"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
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
import { getProfile, saveStudentProfile, type StudentProfilePayload } from "@/services/gradient-api";
import { useAuth } from "@/hooks/use-auth";

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
    <div className="page-shell">
      <AppNav />

      <main className="section-sm" style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <div className="container-narrow">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="eyebrow">
              <Sparkles size={14} /> Student Profile Setup
            </div>
            <h1 className="section-title">Personalize Your Workspace</h1>
            <p className="lead-text" style={{ margin: "0 auto", fontSize: "1rem" }}>
              Gradient AI personalizes its analytical modules and feature access based on your academic standing.
            </p>
          </div>

          {/* Progress Indicator */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
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
              <span style={{ fontSize: "0.85rem", fontWeight: step === 1 ? 700 : 500 }}>Institution & Identity</span>
            </div>

            <div style={{ width: 40, height: 2, background: step >= 2 ? "var(--primary)" : "var(--line)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
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
              <span style={{ fontSize: "0.85rem", fontWeight: step === 2 ? 700 : 500 }}>Academic Standing</span>
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
                      label="College / Institution"
                      placeholder="e.g. Gradient Institute of Technology"
                      value={form.college}
                      onChange={(e) => setForm({ ...form, college: e.target.value })}
                      leftIcon={<Building size={16} />}
                      required
                    />

                    <Input
                      label="Department / Program"
                      placeholder="e.g. Computer Science & Engineering"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      leftIcon={<GraduationCap size={16} />}
                      required
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                      <Button
                        type="submit"
                        rightIcon={<ArrowRight size={16} />}
                        disabled={!form.full_name.trim() || !form.college.trim()}
                      >
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Academic Year Selector Cards */}
                    <div>
                      <label className="form-label" style={{ display: "block", marginBottom: 8 }}>
                        Select Current Academic Year
                      </label>
                      <div className="grid-2" style={{ gap: 12 }}>
                        {[
                          { year: 1, label: "Year 1 (Freshman)", desc: "Academic Intelligence, IA Trends & Timetable" },
                          { year: 2, label: "Year 2 (Sophomore)", desc: "Academic Intelligence, CGPA Forecaster & Timetable" },
                          { year: 3, label: "Year 3 (Junior)", desc: "Full Suite + Career Assessments & Placement Predictor" },
                          { year: 4, label: "Year 4 (Senior)", desc: "Full Suite + Target Company Strategy & Placement Reports" },
                        ].map((item) => {
                          const isSelected = form.academic_year === item.year;
                          return (
                            <div
                              key={item.year}
                              onClick={() => {
                                const defaultSem = item.year * 2 - 1;
                                setForm({ ...form, academic_year: item.year, semester: defaultSem });
                              }}
                              style={{
                                padding: "16px",
                                borderRadius: "var(--radius-sm)",
                                border: isSelected ? "2px solid var(--primary)" : "1px solid var(--line)",
                                background: isSelected ? "var(--primary-subtle)" : "var(--surface)",
                                cursor: "pointer",
                                transition: "all 140ms ease",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isSelected ? "var(--primary)" : "var(--ink)" }}>
                                  {item.label}
                                </span>
                                {item.year >= 3 ? (
                                  <Badge variant="emerald" style={{ fontSize: "0.7rem" }}>Career Unlocked</Badge>
                                ) : (
                                  <Badge variant="neutral" style={{ fontSize: "0.7rem" }}>Academic Only</Badge>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--ink-secondary)", lineHeight: 1.4 }}>
                                {item.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid-2">
                      <Select
                        label="Current Semester"
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </Select>

                      <Input
                        label="Section / Division"
                        placeholder="e.g. A"
                        value={form.section || ""}
                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                      />
                    </div>

                    {/* Feature unlock notification box */}
                    <div
                      style={{
                        padding: "14px 16px",
                        borderRadius: "var(--radius-sm)",
                        background: isSeniorYear ? "var(--primary-subtle)" : "var(--surface-subtle)",
                        border: `1px solid ${isSeniorYear ? "rgba(18, 99, 78, 0.25)" : "var(--line)"}`,
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {isSeniorYear ? (
                        <>
                          <Sparkles size={18} color="var(--primary)" />
                          <span>
                            <strong>Year {form.academic_year} Student:</strong> Full Placement Intelligence, timed assessments, company preparation, and placement PDF reports will be active on your dashboard.
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock size={18} color="var(--ink-tertiary)" />
                          <span>
                            <strong>Year {form.academic_year} Student:</strong> Your workspace will focus strictly on CGPA excellence, IA trend regression, weak-subject diagnosis, and exam timetables.
                          </span>
                        </>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <Button
                        type="button"
                        variant="secondary"
                        leftIcon={<ArrowLeft size={16} />}
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={saving}
                        rightIcon={<CheckCircle2 size={16} />}
                      >
                        Complete Onboarding & Enter Workspace
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
