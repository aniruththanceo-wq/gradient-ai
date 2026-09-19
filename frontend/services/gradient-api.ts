import { apiFetch, getApiBaseUrl } from "@/lib/api";
import type {
  AcademicAnalysis,
  AcademicPredictionResult,
  AcademicRecordPayload,
  AssessmentQuestion,
  AssessmentResult,
  AuthSession,
  Certification,
  CodingProblem,
  CodingResult,
  CompanyPreparation,
  Course,
  FeatureAccess,
  Internship,
  PlacementPredictionResult,
  PlacementProfile,
  Project,
  ReportResult,
  StudentProfile,
  TimetableRequestPayload,
  TimetableResult,
} from "@/types/api";

export type StudentProfilePayload = {
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  semester: number;
  section?: string | null;
};

/* Authentication */
export async function signInWithGoogleCredential(credential: string): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export async function devLogin(persona: string): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/dev-login", {
    method: "POST",
    body: JSON.stringify({ persona }),
  });
}

export async function getSession(): Promise<AuthSession> {
  return apiFetch<AuthSession>("/auth/me");
}

export async function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

/* Student Profile & Feature Access */
export async function saveStudentProfile(payload: StudentProfilePayload): Promise<StudentProfile> {
  return apiFetch<StudentProfile>("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getProfile(): Promise<StudentProfile> {
  return apiFetch<StudentProfile>("/profile");
}

export async function getFeatureAccess(): Promise<FeatureAccess> {
  return apiFetch<FeatureAccess>("/profile/features");
}

/* Academic Services */
export async function saveAcademicRecord(
  payload: AcademicRecordPayload
): Promise<{ id: string; message: string }> {
  return apiFetch<{ id: string; message: string }>("/academic/records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listAcademicRecords(): Promise<
  { id: string; semester: number; previous_cgpa: number; attendance_percentage: number; created_at: string }[]
> {
  return apiFetch("/academic/records");
}

export async function getAcademicAnalysis(recordId: string): Promise<AcademicAnalysis> {
  return apiFetch<AcademicAnalysis>(`/academic/records/${recordId}/analysis`);
}

export async function predictAcademic(recordId: string): Promise<AcademicPredictionResult> {
  return apiFetch<AcademicPredictionResult>(`/academic/records/${recordId}/predict`, {
    method: "POST",
  });
}

export async function generateTimetable(payload: TimetableRequestPayload): Promise<TimetableResult> {
  return apiFetch<TimetableResult>("/academic/timetable", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* Placement Services (Year 3 & 4) */
export async function getPlacementProfile(): Promise<PlacementProfile | null> {
  return apiFetch<PlacementProfile | null>("/placement/profile");
}

export async function savePlacementProfile(payload: PlacementProfile): Promise<PlacementProfile> {
  return apiFetch<PlacementProfile>("/placement/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createProject(payload: Project): Promise<Project> {
  return apiFetch<Project>("/placement/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listProjects(): Promise<Project[]> {
  return apiFetch<Project[]>("/placement/projects");
}

export async function createInternship(payload: Internship): Promise<Internship> {
  return apiFetch<Internship>("/placement/internships", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listInternships(): Promise<Internship[]> {
  return apiFetch<Internship[]>("/placement/internships");
}

export async function createCertification(payload: Certification): Promise<Certification> {
  return apiFetch<Certification>("/placement/certifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCertifications(): Promise<Certification[]> {
  return apiFetch<Certification[]>("/placement/certifications");
}

export async function createCourse(payload: Course): Promise<Course> {
  return apiFetch<Course>("/placement/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCourses(): Promise<Course[]> {
  return apiFetch<Course[]>("/placement/courses");
}

export async function listQuestions(assessmentType: string): Promise<AssessmentQuestion[]> {
  return apiFetch<AssessmentQuestion[]>(`/placement/assessments/${assessmentType}/questions`);
}

export async function submitAssessment(payload: {
  assessment_type: string;
  time_taken_seconds?: number;
  answers: { question_id: string; selected_answer: string }[];
}): Promise<AssessmentResult> {
  return apiFetch<AssessmentResult>("/placement/assessments/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listCodingProblems(): Promise<CodingProblem[]> {
  return apiFetch<CodingProblem[]>("/placement/coding/problems");
}

export async function submitCodingAttempt(payload: {
  time_taken_seconds?: number;
  submissions: { problem_id: string; language: string; submitted_code: string }[];
}): Promise<CodingResult> {
  return apiFetch<CodingResult>("/placement/coding/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function predictPlacement(): Promise<PlacementPredictionResult> {
  return apiFetch<PlacementPredictionResult>("/placement/predict", {
    method: "POST",
  });
}

export async function setCompanyTarget(companyName: string, role?: string): Promise<CompanyPreparation> {
  return apiFetch<CompanyPreparation>("/placement/company-target", {
    method: "POST",
    body: JSON.stringify({ company_name: companyName, role }),
  });
}

/* Reports */
export async function createAcademicReport(recordId: string): Promise<ReportResult> {
  return apiFetch<ReportResult>(`/reports/academic/${recordId}`, {
    method: "POST",
  });
}

export async function createPlacementReport(): Promise<ReportResult> {
  return apiFetch<ReportResult>("/reports/placement", {
    method: "POST",
  });
}

export function getReportDownloadUrl(reportId: string): string {
  return `${getApiBaseUrl()}/reports/${reportId}/download`;
}
