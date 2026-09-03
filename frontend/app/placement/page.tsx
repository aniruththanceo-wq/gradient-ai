"use client";

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
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusMessage } from "@/components/ui/status-message";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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

      // Load initial questions and coding problems
      loadQuestions("aptitude");
      loadCodingProblems();

      // Load prediction if profile exists
      if (pProfile) {
        const pred = await predictPlacement().catch(() => null);
        setPrediction(pred);
      }

      // Load target company
      const prep = await setCompanyTarget("Google", "Software Engineer").catch(() => null);
      setCompanyPrep(prep);
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
      if (probs.length > 0 && Object.keys(submittedCodes).length === 0) {
        setSubmittedCodes({
          [probs[0].id]: `def two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []`,
        });
      }
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
      setStatusMessage("Placement profile saved. Placement readiness & expected package updated.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save placement profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Add Tag Helpers
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

  // Submit Assessment Flow
  async function handleSubmitAssessment() {
    if (questions.length === 0) return;
    setSubmittingAssessment(true);
    setErrorMessage(null);

    const answers = Object.entries(userAnswers).map(([qId, ans]) => ({
      question_id: qId,
      selected_answer: ans,
    }));

    if (answers.length < questions.length) {
      setErrorMessage(`Please answer all ${questions.length} questions before submitting (currently answered ${answers.length}).`);
      setSubmittingAssessment(false);
      return;
    }

    try {
      const res = await submitAssessment({
        assessment_type: assessmentType,
        time_taken_seconds: 180,
        answers,
      });
      setAssessmentResult(res);
      if (assessmentType === "aptitude") setAptitudeScore(res.percentage);
      if (assessmentType === "communication") setCommScore(res.percentage);

      const pred = await predictPlacement().catch(() => null);
      setPrediction(pred);
      setStatusMessage(`${assessmentType.toUpperCase()} Assessment completed! Score: ${res.score}/${res.max_score} (${res.percentage}%).`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit assessment.");
    } finally {
      setSubmittingAssessment(false);
    }
  }

  // Submit Coding Assessment Flow
  async function handleSubmitCoding() {
    if (codingProblems.length === 0) return;
    setSubmittingCoding(true);
    setErrorMessage(null);

    const submissions = codingProblems.map((prob) => ({
      problem_id: prob.id,
      language: selectedLanguage,
      submitted_code: submittedCodes[prob.id] || "def solution():\n    return 0",
    }));

    try {
      const res = await submitCodingAttempt({
        time_taken_seconds: 600,
        submissions,
      });
      setCodingResult(res);
      const totalMax = codingProblems.reduce((sum, p) => sum + p.max_score, 0);
      const percentage = Math.round((res.total_score / totalMax) * 100);
      setCodingScore(percentage);

      const pred = await predictPlacement().catch(() => null);
      setPrediction(pred);
      setStatusMessage(`Coding assessment evaluated safely via static rubric! Score: ${res.total_score}/${totalMax} (${percentage}%).`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit coding attempt.");
    } finally {
      setSubmittingCoding(false);
    }
  }

  // Change Target Company
  async function handleCompanyChange(company: string) {
    setSelectedCompany(company);
    try {
      const prep = await setCompanyTarget(company, targetRole);
      setCompanyPrep(prep);
    } catch {
      // fallback
    }
  }

  // Generate Placement PDF Report
  async function handleCreatePlacementReport() {
    setGeneratingReport(true);
    setErrorMessage(null);
    try {
      const rep = await createPlacementReport();
      setGeneratedReportId(rep.id);
      setStatusMessage("Placement Intelligence PDF report generated successfully — click Download to save.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to generate report.");
    } finally {
      setGeneratingReport(false);
    }
  }

  // Year 1 & 2 Security Gate Check
  if (session?.profile && session.profile.academic_year < 3) {
    return (
      <div className="page-shell">
        <AppNav />
        <main className="section">
          <div className="container-narrow">
            <Card elevated>
              <CardContent style={{ padding: 48, textAlign: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--amber-subtle)",
                    color: "var(--amber)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <Lock size={28} />
                </div>
                <Badge variant="year" style={{ marginBottom: 12 }}>Year {session.profile.academic_year} Student</Badge>
                <h1 className="section-title">Placement Intelligence Locked</h1>
                <p className="lead-text" style={{ margin: "0 auto 28px" }}>
                  Placement Intelligence, portfolio tracking, and Tier-1 assessments unlock in Year 3. For Year {session.profile.academic_year}, focus on building strong IA scores and maintaining a high CGPA foundation.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  <Button variant="primary" onClick={() => (window.location.href = "/academic")}>
                    Go to Academic Intelligence <ArrowRight size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Radar chart formatted dimensions
  const radarData = prediction?.readiness_dimensions
    ? [
        { subject: "Academics", A: prediction.readiness_dimensions.academics, fullMark: 100 },
        { subject: "Aptitude", A: prediction.readiness_dimensions.aptitude, fullMark: 100 },
        { subject: "Coding", A: prediction.readiness_dimensions.coding, fullMark: 100 },
        { subject: "Communication", A: prediction.readiness_dimensions.communication, fullMark: 100 },
        { subject: "Portfolio", A: prediction.readiness_dimensions.portfolio, fullMark: 100 },
        { subject: "Skills", A: prediction.readiness_dimensions.skills, fullMark: 100 },
      ]
    : [];

  return (
    <div className="page-shell">
      <AppNav />

      <main className="section-sm">
        <div className="container" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="eyebrow"><Briefcase size={14} /> Career Intelligence (Year 3 & 4)</div>
              <h1 className="section-title">Placement Profile & Interview Readiness</h1>
              <p className="lead-text" style={{ margin: 0, fontSize: "0.95rem" }}>
                Evaluate placement probability, take timed assessments, manage resume artifacts, and prepare for target companies.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreatePlacementReport}
                isLoading={generatingReport}
                leftIcon={<FileText size={15} />}
              >
                Generate Placement Report
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
                      await downloadReportPdf(generatedReportId, "placement-intelligence-report.pdf");
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
          </div>

          {/* Navigation Tabs */}
          <Tabs
            tabs={[
              { id: "profile", label: "1. Placement Profile", icon: <User size={16} /> },
              { id: "portfolio", label: "2. Portfolio Artifacts", icon: <Layers size={16} />, badge: projects.length + internships.length },
              { id: "assessments", label: "3. Timed Assessments", icon: <Target size={16} /> },
              { id: "prediction", label: "4. Readiness Radar & ML Prognosis", icon: <Sparkles size={16} /> },
              { id: "companies", label: "5. Target Company Strategy", icon: <Building size={16} /> },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />

          {/* Feedback Alerts */}
          {statusMessage && <StatusMessage kind="success">{statusMessage}</StatusMessage>}
          {errorMessage && <StatusMessage kind="error">{errorMessage}</StatusMessage>}

          {/* TAB 1: PLACEMENT PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Card elevated>
                <CardHeader>
                  <CardTitle>Academic & Target Role Parameters</CardTitle>
                  <CardDescription>
                    Core metrics utilized in placement probability classification and LPA package regression
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid-4" style={{ marginBottom: 18 }}>
                    <Input
                      label="Current CGPA"
                      type="number"
                      step="0.01"
                      min={0}
                      max={10}
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      required
                    />

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
                      label="Active Backlogs"
                      type="number"
                      min={0}
                      max={10}
                      value={backlogs}
                      onChange={(e) => setBacklogs(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="grid-2" style={{ gap: 20 }}>
                    <Input
                      label="Target Role"
                      placeholder="e.g. Full Stack Engineer / Systems Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      required
                    />

                    <Select
                      label="DSA Preparation Level"
                      value={dsaPrep}
                      onChange={(e) => setDsaPrep(e.target.value)}
                    >
                      <option value="beginner">Beginner (Arrays, Strings, Basic Search)</option>
                      <option value="intermediate">Intermediate (Trees, Graphs, DP, Heaps)</option>
                      <option value="advanced">Advanced (Hard Graph, Segment Trees, Trie)</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Programming Languages Manager */}
              <Card elevated>
                <CardHeader>
                  <CardTitle>Languages & Technical Skills</CardTitle>
                  <CardDescription>Add role-relevant technologies to strengthen your portfolio index</CardDescription>
                </CardHeader>

                <CardContent style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Programming Languages */}
                  <div>
                    <label className="form-label" style={{ display: "block", marginBottom: 6 }}>
                      Programming Languages
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {languages.map((lang) => (
                        <span
                          key={lang}
                          className="badge badge-emerald"
                          style={{ fontSize: "0.85rem", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => setLanguages(languages.filter((l) => l !== lang))}
                            style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit", padding: 0 }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, maxWidth: 360 }}>
                      <Input
                        placeholder="e.g. Go, Java, C++"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLanguageTag(); } }}
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={addLanguageTag}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <label className="form-label" style={{ display: "block", marginBottom: 6 }}>
                      Technical Frameworks & Tools
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="badge badge-neutral"
                          style={{ fontSize: "0.85rem", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => setSkills(skills.filter((s) => s !== skill))}
                            style={{ border: "none", background: "transparent", cursor: "pointer", color: "inherit", padding: 0 }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, maxWidth: 360 }}>
                      <Input
                        placeholder="e.g. Docker, Redis, Kubernetes"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkillTag(); } }}
                      />
                      <Button type="button" variant="secondary" size="sm" onClick={addSkillTag}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <Button type="submit" variant="primary" size="lg" isLoading={savingProfile} rightIcon={<Sparkles size={18} />}>
                      Save Profile & Recalculate Placement ML
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* TAB 2: PORTFOLIO MANAGER (PROJECTS, INTERNSHIPS, CERTS, COURSES) */}
          {activeTab === "portfolio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Projects Section */}
              <Card>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CardTitle>Engineering Projects ({projects.length})</CardTitle>
                      <CardDescription>Substantial projects with public code repositories or live demos</CardDescription>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setModalType("project")} leftIcon={<Plus size={15} />}>
                      Add Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <EmptyState
                      title="No Projects Added"
                      description="Add your key academic and open-source projects to boost your portfolio readiness."
                      action={<Button size="sm" onClick={() => setModalType("project")}>Add First Project</Button>}
                    />
                  ) : (
                    <div className="grid-2">
                      {projects.map((proj, idx) => (
                        <div key={idx} className="gradient-card card-pad" style={{ background: "var(--surface-subtle)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                            <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{proj.title}</h4>
                            <Badge variant="emerald">{proj.status}</Badge>
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
                            {proj.description}
                          </p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                            {proj.technologies?.map((tech) => (
                              <span key={tech} className="badge badge-neutral" style={{ fontSize: "0.72rem" }}>{tech}</span>
                            ))}
                          </div>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                              View Live / Code <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Internships Section */}
              <Card>
                <CardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CardTitle>Industry Internships ({internships.length})</CardTitle>
                      <CardDescription>Professional work experience and verified internship engagements</CardDescription>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setModalType("internship")} leftIcon={<Plus size={15} />}>
                      Add Internship
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {internships.length === 0 ? (
                    <EmptyState
                      title="No Internships Recorded"
                      description="Document your practical internship experience and quantifiable outcomes."
                      action={<Button size="sm" onClick={() => setModalType("internship")}>Add Internship</Button>}
                    />
                  ) : (
                    <div className="grid-2">
                      {internships.map((intern, idx) => (
                        <div key={idx} className="gradient-card card-pad" style={{ background: "var(--surface-subtle)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                            <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>{intern.role}</h4>
                            <Badge variant="year">{intern.duration}</Badge>
                          </div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--primary)", marginBottom: 8 }}>
                            {intern.organization}
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", margin: "0 0 8px", lineHeight: 1.5 }}>
                            {intern.responsibilities}
                          </p>
                          <div style={{ fontSize: "0.8rem", color: "var(--success)", fontWeight: 600 }}>
                            Impact: {intern.outcomes}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Certifications & Courses Grid */}
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
                      <p style={{ fontSize: "0.85rem", color: "var(--ink-tertiary)", margin: 0 }}>No certifications added yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {certifications.map((c, i) => (
                          <div key={i} style={{ padding: "10px 12px", background: "var(--surface-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{c.name}</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-secondary)" }}>{c.provider} &bull; {c.category}</div>
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
              {/* Assessment Type Picker */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  variant={assessmentType === "aptitude" ? "primary" : "secondary"}
                  onClick={() => { setAssessmentType("aptitude"); loadQuestions("aptitude"); }}
                  leftIcon={<Target size={16} />}
                >
                  Aptitude Assessment (20 Qs)
                </Button>
                <Button
                  variant={assessmentType === "coding" ? "primary" : "secondary"}
                  onClick={() => { setAssessmentType("coding"); loadCodingProblems(); }}
                  leftIcon={<Code2 size={16} />}
                >
                  Coding Assessment (3 Problems &bull; 30m)
                </Button>
                <Button
                  variant={assessmentType === "communication" ? "primary" : "secondary"}
                  onClick={() => { setAssessmentType("communication"); loadQuestions("communication"); }}
                  leftIcon={<MessageSquare size={16} />}
                >
                  Communication Assessment (15 Qs)
                </Button>
              </div>

              {/* Assessment Sub-Runner: Aptitude / Communication MCQ */}
              {(assessmentType === "aptitude" || assessmentType === "communication") && (
                <Card elevated>
                  <CardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <CardTitle>
                          {assessmentType === "aptitude" ? "Aptitude Evaluation" : "Communication & Verbal Evaluation"}
                        </CardTitle>
                        <CardDescription>
                          {assessmentType === "aptitude"
                            ? "20 questions covering Quantitative, Logical Reasoning, Verbal, and Data Interpretation"
                            : "15 questions covering Grammar, Vocabulary, Sentence Correction, and Business Communication"}
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
                      <strong>Safe Static Evaluation:</strong> Gradient AI uses safe static code rubric analysis (verifying return paths, loops, time complexity, and data structures) without executing arbitrary code on the server.
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
                            <CardTitle style={{ fontSize: "1rem" }}>Problem Details</CardTitle>
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
                  {/* Top Forecast KPI Highlights */}
                  <div className="grid-3">
                    <MetricCard
                      title="Placement Probability"
                      value={`${Math.round(prediction.placement_probability * 100)}%`}
                      subValue={prediction.predicted_status}
                      badge={<Badge variant="emerald">Supervised Model</Badge>}
                      icon={<Briefcase size={22} />}
                    />

                    <MetricCard
                      title="Expected Package (LPA)"
                      value={`${prediction.expected_lpa} LPA`}
                      subValue="Prototype Ridge Regressor"
                      icon={<TrendingUp size={22} />}
                    />

                    <MetricCard
                      title="Overall Readiness Score"
                      value={`${prediction.readiness_score}%`}
                      subValue="Across 6 Core Dimensions"
                      icon={<Target size={22} />}
                    />
                  </div>

                  {/* Readiness Radar & Interview Stage Readiness */}
                  <div className="grid-2">
                    {/* Recharts Radar Chart */}
                    <Card elevated>
                      <CardHeader>
                        <CardTitle>6-Dimension Placement Readiness Radar</CardTitle>
                        <CardDescription>Comprehensive competency radar across core hiring criteria</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div style={{ width: "100%", height: 320 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                              <PolarGrid stroke="var(--line)" />
                              <PolarAngleAxis dataKey="subject" stroke="var(--ink)" tick={{ fontSize: 12, fontWeight: 600 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} />
                              <Radar name="Readiness" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
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
                    onClick={() => handleCompanyChange(comp)}
                    leftIcon={<Building size={16} />}
                  >
                    {comp} Strategy
                  </Button>
                ))}
              </div>

              {companyPrep && (
                <div className="grid-2">
                  <Card elevated>
                    <CardHeader>
                      <CardTitle>{companyPrep.company_name} Preparation Benchmark</CardTitle>
                      <CardDescription>{companyPrep.source_label} &bull; Updated {companyPrep.source_date}</CardDescription>
                    </CardHeader>
                    <CardContent style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--ink)" }}>
                        Critical Focus Areas for {companyPrep.company_name}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {companyPrep.focus_areas.map((area, aIdx) => (
                          <div key={aIdx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem" }}>
                            <CheckCircle2 size={16} color="var(--primary)" /> {area}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card elevated>
                    <CardHeader>
                      <CardTitle>Your Personalized Roadmap for {companyPrep.company_name}</CardTitle>
                      <CardDescription>Tailored milestones based on your current assessment scores</CardDescription>
                    </CardHeader>
                    <CardContent style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--primary)" }}>Phase 1: DSA Speed & Patterns</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", marginTop: 2 }}>
                          Complete 40 medium problems focusing on Graph Traversal, Trees, and Dynamic Programming.
                        </div>
                      </div>

                      <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--teal)" }}>Phase 2: System Fundamentals & Portfolio</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", marginTop: 2 }}>
                          Review OS concurrency, indexing in relational databases, and architect a distributed capstone project.
                        </div>
                      </div>

                      <div style={{ padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--surface-subtle)", border: "1px solid var(--line)" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--amber)" }}>Phase 3: Mock Behavioral & Technical Interviews</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)", marginTop: 2 }}>
                          Frame project stories using the STAR methodology and take timed communication assessments.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Portfolio Modals */}
      {modalType === "project" && (
        <Modal isOpen={true} onClose={() => setModalType(null)} title="Add Engineering Project">
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
            <Textarea label="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} required />
            <Input label="Role" value={projectForm.role} onChange={(e) => setProjectForm({ ...projectForm, role: e.target.value })} required />
            <Input label="Technologies (comma separated)" placeholder="React, FastAPI, PostgreSQL" onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} />
            <Input label="Repository / Demo URL" value={projectForm.link || ""} onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })} />
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
            <Input label="Company / Organization" value={internshipForm.organization} onChange={(e) => setInternshipForm({ ...internshipForm, organization: e.target.value })} required />
            <Input label="Role" value={internshipForm.role} onChange={(e) => setInternshipForm({ ...internshipForm, role: e.target.value })} required />
            <Input label="Duration" placeholder="e.g. 3 months" value={internshipForm.duration} onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })} required />
            <Textarea label="Key Responsibilities" value={internshipForm.responsibilities} onChange={(e) => setInternshipForm({ ...internshipForm, responsibilities: e.target.value })} required />
            <Textarea label="Quantifiable Outcomes" value={internshipForm.outcomes} onChange={(e) => setInternshipForm({ ...internshipForm, outcomes: e.target.value })} required />
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
            <Input label="Credential URL" value={certForm.credential_url || ""} onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })} />
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
    </div>
  );
}
