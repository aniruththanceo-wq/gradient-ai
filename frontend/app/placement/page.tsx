"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Lock,
  MessageSquare,
  Plus,
  Radio,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, RiskBadge, PriorityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusMessage } from "@/components/ui/status-message";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PlacementRadar } from "@/components/charts/placement-radar";
import { PageTransition, GlowingCard, AnimatedCounter } from "@/components/motion/motion-primitives";
import { emitSpatialEvent } from "@/lib/spatial-events";
import { useAuth } from "@/hooks/use-auth";
import { downloadReportPdf } from "@/lib/api";
import {
  createCertification,
  createCourse,
  createInternship,
  createPlacementReport,
  createProject,
  getPlacementProfile,
  listCertifications,
  listCodingProblems,
  listCourses,
  listInternships,
  listProjects,
  listQuestions,
  predictPlacement,
  savePlacementProfile,
  setCompanyTarget,
  submitAssessment,
  submitCodingAttempt,
} from "@/services/gradient-api";
import type {
  AssessmentQuestion,
  AssessmentResult,
  Certification,
  CodingProblem,
  CodingResult,
  CompanyPreparation,
  Course,
  Internship,
  PlacementPredictionResult,
  PlacementProfile,
  Project,
} from "@/types/api";

// Dynamically load 3D visual modules
const CareerCapabilityNetwork = dynamic(() => import("@/components/3d/career-capability-network"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: "var(--radius-md)" }} />,
});

const AssessmentMatrix3D = dynamic(() => import("@/components/3d/assessment-matrix-3d"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ width: "100%", height: 140, borderRadius: "var(--radius-md)" }} />,
});

export default function PlacementPage() {
  const { session, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "assessments" | "prediction" | "companies">("profile");

  // Placement Profile Form
  const [cgpa, setCgpa] = useState(8.2);
  const [tenth, setTenth] = useState(88.0);
  const [twelfth, setTwelfth] = useState(85.5);
  const [backlogs, setBacklogs] = useState(0);
  const [aptitudeScore, setAptitudeScore] = useState(70);
  const [codingScore, setCodingScore] = useState(65);
  const [commScore, setCommScore] = useState(75);
  const [dsaPrep, setDsaPrep] = useState("intermediate");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [languages, setLanguages] = useState<string[]>(["Python", "TypeScript", "SQL"]);
  const [newLanguage, setNewLanguage] = useState("");
  const [skills, setSkills] = useState<string[]>(["FastAPI", "React", "PostgreSQL", "Git"]);
  const [newSkill, setNewSkill] = useState("");

  // Portfolio Entities
  const [projects, setProjects] = useState<Project[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Portfolio Modal States
  const [modalType, setModalType] = useState<"project" | "internship" | "certification" | "course" | null>(null);
  const [projectForm, setProjectForm] = useState<Project>({
    title: "",
    description: "",
    technologies: [],
    role: "Lead Developer",
    duration: "3 months",
    status: "Completed",
    link: "",
  });
  const [internshipForm, setInternshipForm] = useState<Internship>({
    organization: "",
    role: "Software Engineering Intern",
    duration: "3 months",
    technologies: [],
    responsibilities: "",
    outcomes: "",
    certificate_url: "",
  });
  const [certForm, setCertForm] = useState<Certification>({
    name: "",
    provider: "",
    category: "Cloud / Systems",
    issue_date: "",
    credential_id: "",
    credential_url: "",
  });
  const [courseForm, setCourseForm] = useState<Course>({
    name: "",
    provider: "",
    category: "Computer Science",
    completion_status: "Completed",
    completion_date: "",
    credential_url: "",
  });

  // Assessments State
  const [assessmentType, setAssessmentType] = useState<"aptitude" | "coding" | "communication">("aptitude");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Coding Assessment State
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [submittedCodes, setSubmittedCodes] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [codingResult, setCodingResult] = useState<CodingResult | null>(null);
  const [submittingCoding, setSubmittingCoding] = useState(false);

  // Prediction & Company Strategy State
  const [prediction, setPrediction] = useState<PlacementPredictionResult | null>(null);
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [companyPrep, setCompanyPrep] = useState<CompanyPreparation | null>(null);

  // Status & Feedback
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.profile && session.profile.academic_year >= 3) {
      loadPlacementData();
    }
  }, [session]);

  async function loadPlacementData() {
    try {
      const pProfile = await getPlacementProfile();
      if (pProfile) {
        setCgpa(pProfile.cgpa);
        setTenth(pProfile.tenth_percentage);
        setTwelfth(pProfile.twelfth_percentage);
        setBacklogs(pProfile.backlog_count);
        setAptitudeScore(pProfile.aptitude_score);
        setCodingScore(pProfile.coding_score);
        setCommScore(pProfile.communication_score);
        setDsaPrep(pProfile.dsa_preparation);
        setTargetRole(pProfile.target_role);
        setLanguages(pProfile.programming_languages || []);
        setSkills(pProfile.technical_skills || []);
      }

      const [projs, interns, certs, crses] = await Promise.all([
        listProjects().catch(() => []),
        listInternships().catch(() => []),
        listCertifications().catch(() => []),
        listCourses().catch(() => []),
      ]);
      setProjects(projs);
      setInternships(interns);
      setCertifications(certs);
      setCourses(crses);

      loadQuestions("aptitude");
      loadCodingProblems();

      if (pProfile) {
        const pred = await predictPlacement().catch(() => null);
        setPrediction(pred);
      }
    } catch {
      // fallback
    }
  }

  async function loadQuestions(type: string) {
    try {
      const qList = await listQuestions(type);
      setQuestions(qList);
      setUserAnswers({});
      setAssessmentResult(null);
    } catch {
      // fallback
    }
  }

  async function loadCodingProblems() {
    try {
      const probs = await listCodingProblems();
      setCodingProblems(probs);
    } catch {
      // fallback
    }
  }

  // Save Placement Profile
  async function handleSaveProfile(event: FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    setErrorMessage(null);
    try {
      const payload: PlacementProfile = {
        cgpa,
        tenth_percentage: tenth,
        twelfth_percentage: twelfth,
        backlog_count: backlogs,
        aptitude_score: aptitudeScore,
        coding_score: codingScore,
        communication_score: commScore,
        dsa_preparation: dsaPrep,
        target_role: targetRole,
        programming_languages: languages,
        technical_skills: skills,
      };
      await savePlacementProfile(payload);
      const pred = await predictPlacement();
      setPrediction(pred);
      emitSpatialEvent({ type: "energy-pulse", intensity: 0.8, color: "#38bdf8" });
      setStatusMessage("Placement profile saved. Placement readiness & expected package updated.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save placement profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  function addLanguageTag() {
    if (!newLanguage.trim() || languages.includes(newLanguage.trim())) return;
    setLanguages([...languages, newLanguage.trim()]);
    setNewLanguage("");
  }

  function addSkillTag() {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  }

  async function handleSubmitAssessment() {
    if (Object.keys(userAnswers).length === 0) {
      setErrorMessage("Please answer at least one question before submitting.");
      return;
    }
    setSubmittingAssessment(true);
    setErrorMessage(null);
    try {
      const result = await submitAssessment({
        assessment_type: assessmentType,
        answers: Object.entries(userAnswers).map(([question_id, selected_answer]) => ({
          question_id,
          selected_answer,
        })),
      });
      setAssessmentResult(result);
      if (assessmentType === "aptitude") setAptitudeScore(result.percentage);
      if (assessmentType === "communication") setCommScore(result.percentage);
      const pred = await predictPlacement();
      setPrediction(pred);
      emitSpatialEvent({ type: "energy-pulse", intensity: 0.85, color: "#10b981" });
      setStatusMessage(`${assessmentType.toUpperCase()} assessment scored: ${result.percentage}%`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit assessment.");
    } finally {
      setSubmittingAssessment(false);
    }
  }

  async function handleSubmitCoding() {
    const currentProb = codingProblems[activeProblemIdx];
    if (!currentProb) return;
    const code = submittedCodes[currentProb.id] || "";
    if (!code.trim()) {
      setErrorMessage("Please write code before submitting your solution.");
      return;
    }
    setSubmittingCoding(true);
    setErrorMessage(null);
    try {
      const result = await submitCodingAttempt({
        submissions: [
          {
            problem_id: currentProb.id,
            language: selectedLanguage,
            submitted_code: code,
          },
        ],
      });
      setCodingResult(result);
      setCodingScore(result.total_score);
      const pred = await predictPlacement();
      setPrediction(pred);
      emitSpatialEvent({ type: "energy-pulse", intensity: 0.9, color: "#34d399" });
      setStatusMessage(`Coding Problem ${currentProb.title} scored: ${result.total_score} pts`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Static code evaluation failed.");
    } finally {
      setSubmittingCoding(false);
    }
  }

  async function handleSelectCompany(company: string) {
    setSelectedCompany(company);
    setErrorMessage(null);
    try {
      const prep = await setCompanyTarget(company);
      setCompanyPrep(prep);
      emitSpatialEvent({ type: "energy-pulse", intensity: 0.6, color: "#38bdf8" });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load company preparation roadmap.");
    }
  }

  async function handleCreateReport() {
    setGeneratingReport(true);
    setErrorMessage(null);
    try {
      const rep = await createPlacementReport();
      setGeneratedReportId(rep.id);
      setStatusMessage("Career Intelligence Dossier compiled! Click Download PDF below.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to compile Placement report.");
    } finally {
      setGeneratingReport(false);
    }
  }

  async function handleDownloadReport() {
    if (!generatedReportId) return;
    setDownloadingReport(true);
    try {
      await downloadReportPdf(generatedReportId, "Gradient_Career_Readiness_Dossier.pdf");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      setDownloadingReport(false);
    }
  }

  if (authLoading) {
    return (
      <div className="page-shell">
        <AppNav />
        <main className="section-sm">
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Skeleton height={44} width={280} />
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

  if (!session?.profile || session.profile.academic_year < 3) {
    return (
      <div className="page-shell">
        <AppNav />
        <main className="section">
          <div className="container-narrow">
            <Card elevated>
              <CardContent style={{ padding: 40, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Lock size={30} color="var(--ink-tertiary)" />
                </div>
                <h1 className="section-title">Career Intelligence is Locked</h1>
                <p className="lead-text" style={{ margin: "0 auto 24px" }}>
                  Placement Assessments, Portfolio Tracking, and Tier-1 Company Roadmaps unlock automatically for Year 3 and Year 4 students.
                </p>
                <Link href="/dashboard" className="btn btn-primary">
                  Return to Dashboard
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <PageTransition className="page-shell">
      <AppNav />

      <main className="section-sm">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header & Tabs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="eyebrow"><Briefcase size={14} /> Career &amp; Placement Suite</div>
              <h1 className="section-title">Placement Intelligence</h1>
              <p className="lead-text" style={{ margin: 0, fontSize: "0.95rem" }}>
                6-dimension readiness radar, verified portfolio artifacts, timed assessments, and Tier-1 interview roadmaps.
              </p>
            </div>

            <Tabs
              activeTab={activeTab}
              onChange={(t) => setActiveTab(t as any)}
              tabs={[
                { id: "profile", label: "01 Profile", icon: <User size={15} /> },
                { id: "portfolio", label: "02 Portfolio", icon: <Layers size={15} /> },
                { id: "assessments", label: "03 Assessments", icon: <Code2 size={15} /> },
                { id: "prediction", label: "04 Readiness", icon: <Target size={15} /> },
                { id: "companies", label: "05 Company Prep", icon: <Building size={15} /> },
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

          {/* TAB 1: PLACEMENT PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Card elevated>
                <CardHeader>
                  <CardTitle>Academic &amp; Skill Profile</CardTitle>
                  <CardDescription>
                    Explicit distinction between user-entered academic standing and assessment-calibrated scores.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid-4" style={{ marginBottom: 20 }}>
                    <Input
                      label="Current CGPA (/10)"
                      type="number"
                      step="0.01"
                      min={0}
                      max={10}
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="10th Marks (%)"
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={tenth}
                      onChange={(e) => setTenth(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="12th Marks (%)"
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={twelfth}
                      onChange={(e) => setTwelfth(Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Active Backlogs"
                      type="number"
                      min={0}
                      max={10}
                      value={backlogs}
                      onChange={(e) => setBacklogs(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="grid-3" style={{ marginBottom: 20 }}>
                    <Input
                      label="Target Role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. SDE-1 / ML Engineer"
                      required
                    />
                    <Select
                      label="DSA Preparation Level"
                      value={dsaPrep}
                      onChange={(e) => setDsaPrep(e.target.value)}
                    >
                      <option value="beginner">Beginner (&lt; 50 LeetCode)</option>
                      <option value="intermediate">Intermediate (50–200 LeetCode)</option>
                      <option value="advanced">Advanced (200+ LeetCode)</option>
                    </Select>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span className="form-label">Calibrated Assessment Scores</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span className="badge badge-emerald">Apt: {aptitudeScore}%</span>
                        <span className="badge badge-teal">Code: {codingScore}%</span>
                        <span className="badge badge-indigo">Comm: {commScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Programming Languages Tags */}
                  <div style={{ marginBottom: 18 }}>
                    <label className="form-label" style={{ display: "block", marginBottom: 6 }}>
                      Programming Languages
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                      {languages.map((lang) => (
                        <span key={lang} className="badge badge-emerald" style={{ padding: "5px 10px", fontSize: "0.82rem" }}>
                          {lang}
                          <button
                            type="button"
                            onClick={() => setLanguages(languages.filter((l) => l !== lang))}
                            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 4 }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, maxWidth: 360 }}>
                      <input
                        className="form-input"
                        placeholder="Add language (e.g. Go, Java)"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguageTag(); } }}
                        style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={addLanguageTag}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Technical Skills Tags */}
                  <div>
                    <label className="form-label" style={{ display: "block", marginBottom: 6 }}>
                      Core Technical Skills &amp; Frameworks
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                      {skills.map((sk) => (
                        <span key={sk} className="badge badge-teal" style={{ padding: "5px 10px", fontSize: "0.82rem" }}>
                          {sk}
                          <button
                            type="button"
                            onClick={() => setSkills(skills.filter((s) => s !== sk))}
                            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 4 }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, maxWidth: 360 }}>
                      <input
                        className="form-input"
                        placeholder="Add skill (e.g. Docker, Redis)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillTag(); } }}
                        style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={addSkillTag}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                    <Button type="submit" variant="primary" size="lg" isLoading={savingProfile}>
                      Save Placement Profile &amp; Recalculate Readiness
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* TAB 2: PORTFOLIO ENTITIES (PROJECTS, INTERNSHIPS, CERTS, COURSES) */}
          {activeTab === "portfolio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Projects Card */}
              <Card elevated>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CardTitle>Technical Projects ({projects.length})</CardTitle>
                      <CardDescription>Major software engineering and algorithmic projects</CardDescription>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setModalType("project")} leftIcon={<Plus size={15} />}>
                      Add Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <EmptyState
                      icon={<Code2 size={28} color="var(--primary)" />}
                      title="No Projects Added"
                      description="Add your full-stack apps, ML pipelines, or systems projects to boost your Portfolio capability score."
                      action={<Button variant="secondary" size="sm" onClick={() => setModalType("project")}>Add First Project</Button>}
                    />
                  ) : (
                    <div className="grid-2">
                      {projects.map((proj, i) => (
                        <div key={i} className="gradient-card card-pad" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{proj.title}</h3>
                            <Badge variant="emerald">{proj.status}</Badge>
                          </div>
                          <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                            {proj.description}
                          </p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                            {proj.technologies?.map((tech) => (
                              <span key={tech} className="badge badge-neutral" style={{ fontSize: "0.72rem" }}>{tech}</span>
                            ))}
                          </div>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                              View Repository <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Internships Card */}
              <Card elevated>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CardTitle>Work Experience &amp; Internships ({internships.length})</CardTitle>
                      <CardDescription>Industry engineering roles, responsibilities, and delivered outcomes</CardDescription>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setModalType("internship")} leftIcon={<Plus size={15} />}>
                      Add Internship
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {internships.length === 0 ? (
                    <EmptyState
                      icon={<Briefcase size={28} color="var(--teal)" />}
                      title="No Internships Recorded"
                      description="Document your summer internships or research assistantships to establish industry readiness."
                      action={<Button variant="secondary" size="sm" onClick={() => setModalType("internship")}>Add Internship</Button>}
                    />
                  ) : (
                    <div className="grid-2">
                      {internships.map((intern, i) => (
                        <div key={i} className="gradient-card card-pad" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--ink)" }}>{intern.role}</div>
                          <div style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 600, marginBottom: 8 }}>
                            {intern.organization} &bull; {intern.duration}
                          </div>
                          <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "var(--ink-secondary)", lineHeight: 1.5 }}>
                            {intern.responsibilities}
                          </p>
                          {intern.outcomes && (
                            <div style={{ fontSize: "0.8rem", color: "var(--success)", fontWeight: 600 }}>
                              Impact: {intern.outcomes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Certifications & Courses Row */}
              <div className="grid-2">
                <Card>
                  <CardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <CardTitle>Certifications ({certifications.length})</CardTitle>
                      <Button variant="secondary" size="sm" onClick={() => setModalType("certification")} leftIcon={<Plus size={13} />}>
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {certifications.length === 0 ? (
                      <p style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)", margin: 0 }}>No certifications recorded.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {certifications.map((cert, i) => (
                          <div key={i} style={{ padding: "10px 12px", background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{cert.name}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)" }}>{cert.provider} &bull; {cert.category}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <CardTitle>Completed Courses ({courses.length})</CardTitle>
                      <Button variant="secondary" size="sm" onClick={() => setModalType("course")} leftIcon={<Plus size={13} />}>
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {courses.length === 0 ? (
                      <p style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)", margin: 0 }}>No coursework added yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {courses.map((crs, i) => (
                          <div key={i} style={{ padding: "10px 12px", background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{crs.name}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)" }}>{crs.provider} &bull; {crs.completion_status}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: TIMED ASSESSMENTS (APTITUDE, CODING, COMMUNICATION) */}
          {activeTab === "assessments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Assessment Header with 3D State Matrix */}
              <div className="gradient-card card-pad" style={{ background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 280 }}>
                  <div style={{ width: 120, height: 80 }}>
                    <AssessmentMatrix3D
                      height={80}
                      assessmentType={assessmentType}
                      progressPercentage={
                        questions.length > 0
                          ? Math.round((Object.keys(userAnswers).length / questions.length) * 100)
                          : 0
                      }
                    />
                  </div>
                  <div>
                    <div className="eyebrow"><Sparkles size={13} /> Diagnostic Evaluation Center</div>
                    <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800 }}>
                      Skill &amp; Competency Assessment Hub
                    </h2>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                      Take standardized assessments across Cognitive Aptitude, Static Code Review, and Professional Communication.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button
                    variant={assessmentType === "aptitude" ? "primary" : "secondary"}
                    onClick={() => { setAssessmentType("aptitude"); loadQuestions("aptitude"); }}
                    leftIcon={<Target size={15} />}
                  >
                    Aptitude (20 Qs)
                  </Button>
                  <Button
                    variant={assessmentType === "coding" ? "primary" : "secondary"}
                    onClick={() => { setAssessmentType("coding"); loadCodingProblems(); }}
                    leftIcon={<Code2 size={15} />}
                  >
                    Coding (3 Problems)
                  </Button>
                  <Button
                    variant={assessmentType === "communication" ? "primary" : "secondary"}
                    onClick={() => { setAssessmentType("communication"); loadQuestions("communication"); }}
                    leftIcon={<MessageSquare size={15} />}
                  >
                    Communication (15 Qs)
                  </Button>
                </div>
              </div>

              {/* Assessment Sub-Runner: Aptitude / Communication MCQ */}
              {(assessmentType === "aptitude" || assessmentType === "communication") && (
                <Card elevated>
                  <CardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <CardTitle>
                          {assessmentType === "aptitude" ? "Cognitive Aptitude Evaluation" : "Communication & Verbal Reasoning"}
                        </CardTitle>
                        <CardDescription>
                          {assessmentType === "aptitude"
                            ? "20 questions covering Quantitative, Logical Reasoning, Verbal, and Data Interpretation"
                            : "15 questions covering Grammar, Vocabulary, Sentence Correction, and Business Articulation"}
                        </CardDescription>
                      </div>
                      <Badge variant="emerald">
                        Answered {Object.keys(userAnswers).length} / {questions.length}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        style={{
                          padding: "16px 20px",
                          borderRadius: "var(--radius-sm)",
                          background: userAnswers[q.id] ? "var(--surface)" : "var(--surface-subtle)",
                          border: userAnswers[q.id] ? "1.5px solid var(--primary)" : "1px solid var(--line)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "0.85rem" }}>
                            Question {idx + 1} &bull; {q.category.toUpperCase().replace("_", " ")}
                          </span>
                          <Badge variant="neutral" style={{ fontSize: "0.72rem" }}>{q.difficulty}</Badge>
                        </div>
                        <p style={{ margin: "0 0 14px", fontWeight: 600, fontSize: "0.95rem", color: "var(--ink)" }}>
                          {q.prompt}
                        </p>

                        <div className="grid-2" style={{ gap: 8 }}>
                          {q.options.map((opt) => {
                            const isSelected = userAnswers[q.id] === opt;
                            return (
                              <label
                                key={opt}
                                style={{
                                  padding: "10px 14px",
                                  borderRadius: "var(--radius-sm)",
                                  border: isSelected ? "2px solid var(--primary)" : "1px solid var(--line)",
                                  background: isSelected ? "var(--primary-subtle)" : "var(--surface)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  cursor: "pointer",
                                  fontSize: "0.88rem",
                                  fontWeight: isSelected ? 600 : 400,
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  checked={isSelected}
                                  onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                                  style={{ accentColor: "var(--primary)" }}
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleSubmitAssessment}
                        isLoading={submittingAssessment}
                        rightIcon={<Send size={16} />}
                      >
                        Submit {assessmentType.toUpperCase()} Assessment
                      </Button>
                    </div>

                    {assessmentResult && (
                      <div style={{ padding: "18px", borderRadius: "var(--radius-sm)", background: "var(--success-subtle)", border: "1px solid rgba(29, 124, 77, 0.25)", marginTop: 12 }}>
                        <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--success)", marginBottom: 8 }}>
                          Assessment Results: {assessmentResult.score} / {assessmentResult.max_score} ({assessmentResult.percentage}%)
                        </div>
                        <div className="grid-4" style={{ gap: 10 }}>
                          {Object.entries(assessmentResult.category_scores).map(([cat, cRes]) => (
                            <div key={cat} style={{ padding: "8px 12px", background: "var(--surface)", borderRadius: "var(--radius-xs)" }}>
                              <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>
                                {cat.replace("_", " ")}
                              </div>
                              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)", marginTop: 2 }}>
                                {cRes.percentage}% ({cRes.score}/{cRes.max_score})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Coding Assessment Workspace */}
              {assessmentType === "coding" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--line)",
                      fontSize: "0.85rem",
                      color: "var(--ink-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <ShieldAlert size={18} color="var(--primary)" />
                    <span>
                      <strong>Safe Static Evaluation:</strong> Gradient AI analyzes AST syntax, control flow, return statements, and loop structures statically without executing arbitrary code on the server.
                    </span>
                  </div>

                  <div className="grid-1-2" style={{ alignItems: "flex-start" }}>
                    {/* Problem Selector & Description */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {codingProblems.map((prob, pIdx) => {
                        const isSelected = activeProblemIdx === pIdx;
                        return (
                          <div
                            key={prob.id}
                            onClick={() => setActiveProblemIdx(pIdx)}
                            style={{
                              padding: "16px",
                              borderRadius: "var(--radius-sm)",
                              border: isSelected ? "2px solid var(--primary)" : "1px solid var(--line)",
                              background: isSelected ? "var(--primary-subtle)" : "var(--surface)",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>
                                Problem {pIdx + 1}: {prob.title}
                              </span>
                              <Badge variant={prob.difficulty === "easy" ? "emerald" : prob.difficulty === "medium" ? "amber" : "danger"}>
                                {prob.difficulty}
                              </Badge>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)" }}>
                              Max Score: {prob.max_score} pts
                            </div>
                          </div>
                        );
                      })}

                      {codingProblems[activeProblemIdx] && (
                        <Card>
                          <CardHeader>
                            <CardTitle style={{ fontSize: "1rem" }}>Problem Specification</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p style={{ margin: "0 0 12px", fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.6 }}>
                              {codingProblems[activeProblemIdx].prompt}
                            </p>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-tertiary)" }}>
                              {codingProblems[activeProblemIdx].safe_evaluation_notes}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Code Editor Area */}
                    <Card elevated>
                      <CardHeader>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <CardTitle style={{ fontSize: "1rem" }}>Solution Workbench</CardTitle>
                          <Select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            style={{ width: 140, padding: "4px 8px", fontSize: "0.82rem" }}
                          >
                            <option value="python">Python 3</option>
                            <option value="javascript">JavaScript</option>
                            <option value="cpp">C++ 20</option>
                            <option value="java">Java 17</option>
                          </Select>
                        </div>
                      </CardHeader>

                      <CardContent style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {codingProblems[activeProblemIdx] && (
                          <textarea
                            className="form-input"
                            value={submittedCodes[codingProblems[activeProblemIdx].id] || ""}
                            onChange={(e) => {
                              const pId = codingProblems[activeProblemIdx].id;
                              setSubmittedCodes({ ...submittedCodes, [pId]: e.target.value });
                            }}
                            rows={16}
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.9rem",
                              lineHeight: 1.5,
                              whiteSpace: "pre",
                              tabSize: 4,
                            }}
                            placeholder="# Write your clean solution here..."
                          />
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={handleSubmitCoding}
                            isLoading={submittingCoding}
                            leftIcon={<Code2 size={16} />}
                          >
                            Submit Coding Solutions for Static Review
                          </Button>
                        </div>

                        {codingResult && (
                          <div style={{ padding: "16px", borderRadius: "var(--radius-sm)", background: "var(--success-subtle)", border: "1px solid rgba(29, 124, 77, 0.25)" }}>
                            <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--success)", marginBottom: 6 }}>
                              Total Static Score: {codingResult.total_score} pts &bull; Mode: Safe Static Review
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82rem", color: "var(--ink)" }}>
                              {codingResult.review_notes.map((note, nIdx) => (
                                <li key={nIdx}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: READINESS RADAR & ML PROGNOSIS */}
          {activeTab === "prediction" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {!prediction ? (
                <EmptyState
                  icon={<Sparkles size={32} color="var(--primary)" />}
                  title="Placement Prognosis Not Calculated Yet"
                  description="Save your Placement Profile in Tab 1 and take assessments in Tab 3 to compute placement probability and expected LPA."
                  action={<Button variant="primary" onClick={() => setActiveTab("profile")}>Open Profile Tab</Button>}
                />
              ) : (
                <>
                  {/* Top 3D Capability Network Banner */}
                  <div className="gradient-card card-pad" style={{ background: "var(--surface)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 280 }}>
                      <div style={{ width: 140, height: 100 }}>
                        <CareerCapabilityNetwork
                          height={100}
                          readinessScore={prediction.readiness_score}
                          dimensions={prediction.readiness_dimensions}
                        />
                      </div>
                      <div>
                        <div className="eyebrow"><Sparkles size={13} /> 6-Axis Capability Analysis</div>
                        <h2 style={{ margin: "0 0 4px", fontSize: "1.3rem", fontWeight: 800 }}>
                          Placement Readiness &amp; Probability Forecast
                        </h2>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
                          Weighted ML inference comparing your profile against historical Tier-1 hiring baselines.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

                  {/* Top Forecast KPI Highlights with Animated Counters */}
                  <div className="grid-3">
                    <GlowingCard className="card-pad">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink-tertiary)", textTransform: "uppercase" }}>
                          Placement Probability
                        </span>
                        <Briefcase size={20} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--primary)" }}>
                        <AnimatedCounter value={Math.round(prediction.placement_probability * 100)} suffix="%" duration={1} />
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", marginTop: 4 }}>
                        {prediction.predicted_status}
                      </div>
                    </GlowingCard>

                    <GlowingCard className="card-pad">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink-tertiary)", textTransform: "uppercase" }}>
                          Expected Package Range
                        </span>
                        <TrendingUp size={20} color="var(--teal)" />
                      </div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--ink)" }}>
                        {prediction.package_range_low}–{prediction.package_range_high} <span style={{ fontSize: "0.9rem", color: "var(--ink-tertiary)" }}>LPA</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", marginTop: 4 }}>
                        Prototype estimated package range; not a salary guarantee
                      </div>
                    </GlowingCard>

                    <GlowingCard className="card-pad">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink-tertiary)", textTransform: "uppercase" }}>
                          Overall Readiness Score
                        </span>
                        <Target size={20} color="var(--amber)" />
                      </div>
                      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--ink)" }}>
                        <AnimatedCounter value={prediction.readiness_score} suffix="%" duration={1} />
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)", marginTop: 4 }}>
                        Across 6 Core Dimensions
                      </div>
                    </GlowingCard>
                  </div>

                  {/* Readiness Radar & Interview Stage Readiness */}
                  <div className="grid-2">
                    {/* Animated Placement Radar */}
                    <Card elevated>
                      <CardHeader>
                        <CardTitle>6-Dimension Placement Readiness Radar</CardTitle>
                        <CardDescription>Comprehensive competency radar across core hiring criteria</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PlacementRadar
                          dimensions={prediction.readiness_dimensions}
                          readinessScore={prediction.readiness_score}
                          height={320}
                        />
                      </CardContent>
                    </Card>

                    {/* Interview Round Readiness */}
                    <Card elevated>
                      <CardHeader>
                        <CardTitle>Interview Round Readiness Breakdown</CardTitle>
                        <CardDescription>Advisory status for standard Tier-1 recruitment stages</CardDescription>
                      </CardHeader>
                      <CardContent style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {Object.entries(prediction.interview_stage_readiness).map(([stage, status]) => (
                          <div
                            key={stage}
                            style={{
                              padding: "12px 16px",
                              borderRadius: "var(--radius-sm)",
                              background: "var(--surface-subtle)",
                              border: "1px solid var(--line)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>{stage} Round</span>
                            <Badge variant={status === "Ready" ? "emerald" : status === "Developing" ? "amber" : "danger"}>
                              {status}
                            </Badge>
                          </div>
                        ))}

                        {/* Skill Gaps Alert */}
                        {prediction.skill_gaps.length > 0 && (
                          <div style={{ padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--amber-subtle)", border: "1px solid rgba(192, 120, 23, 0.25)", marginTop: 6 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--amber)", marginBottom: 4 }}>
                              Identified Skill Gaps
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {prediction.skill_gaps.map((gap) => (
                                <span key={gap} className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>{gap}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 5: TARGET COMPANY STRATEGY */}
          {activeTab === "companies" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Company Picker Tabs */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["Google", "Amazon", "Microsoft", "Meta", "OpenAI"].map((comp) => (
                  <Button
                    key={comp}
                    variant={selectedCompany === comp ? "primary" : "secondary"}
                    onClick={() => handleSelectCompany(comp)}
                    leftIcon={<Building size={16} />}
                  >
                    {comp}
                  </Button>
                ))}
              </div>

              {companyPrep && (
                <Card elevated>
                  <CardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <CardTitle>{companyPrep.company_name} Target Preparation Hub</CardTitle>
                        <CardDescription>Source: {companyPrep.source_label} &bull; Updated: {companyPrep.source_date}</CardDescription>
                      </div>
                      <Badge variant="year">{selectedCompany}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Focus Areas */}
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
                        Core Technical Focus Areas:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                        {companyPrep.focus_areas.map((fa, fIdx) => (
                          <li key={fIdx}>{fa}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Preparation Roadmap */}
                    <div style={{ padding: "16px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 8, color: "var(--ink)" }}>
                        Strategic Target Recommendation:
                      </div>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
                        Focus preparation on core algorithmic patterns, system architecture fundamentals, and clean coding practices tailored to {companyPrep.company_name}.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Progressive Disclosure Modals for Portfolio Entities */}
      {modalType === "project" && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Add Technical Project">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await createProject(projectForm);
              const list = await listProjects();
              setProjects(list);
              setModalType(null);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Input label="Project Title" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required />
            <Textarea label="Description & Outcomes" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} required />
            <Input label="Technologies (comma-separated)" value={projectForm.technologies.join(", ")} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} required />
            <Input label="Repository or Demo URL" type="url" value={projectForm.link || ""} onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Project</Button>
            </div>
          </form>
        </Modal>
      )}

      {modalType === "internship" && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Add Internship Experience">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await createInternship(internshipForm);
              const list = await listInternships();
              setInternships(list);
              setModalType(null);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Input label="Organization / Company" value={internshipForm.organization} onChange={(e) => setInternshipForm({ ...internshipForm, organization: e.target.value })} required />
            <Input label="Role" value={internshipForm.role} onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })} required />
            <Input label="Duration" value={internshipForm.duration} onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })} placeholder="e.g. 3 months" required />
            <Textarea label="Key Responsibilities" value={internshipForm.responsibilities} onChange={(e) => setInternshipForm({ ...internshipForm, responsibilities: e.target.value })} required />
            <Input label="Delivered Impact / Outcomes" value={internshipForm.outcomes || ""} onChange={(e) => setInternshipForm({ ...internshipForm, outcomes: e.target.value })} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Internship</Button>
            </div>
          </form>
        </Modal>
      )}

      {modalType === "certification" && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Add Certification">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await createCertification(certForm);
              const list = await listCertifications();
              setCertifications(list);
              setModalType(null);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Input label="Certification Name" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} required />
            <Input label="Issuing Organization" value={certForm.provider} onChange={(e) => setCertForm({ ...certForm, provider: e.target.value })} required />
            <Input label="Category" value={certForm.category} onChange={(e) => setCertForm({ ...certForm, category: e.target.value })} required />
            <Input label="Credential ID" value={certForm.credential_id || ""} onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Certification</Button>
            </div>
          </form>
        </Modal>
      )}

      {modalType === "course" && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Add Completed Coursework">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await createCourse(courseForm);
              const list = await listCourses();
              setCourses(list);
              setModalType(null);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Input label="Course Name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} required />
            <Input label="Platform / University" value={courseForm.provider} onChange={(e) => setCourseForm({ ...courseForm, provider: e.target.value })} required />
            <Input label="Category" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} required />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <Button type="button" variant="secondary" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Course</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageTransition>
  );
}
