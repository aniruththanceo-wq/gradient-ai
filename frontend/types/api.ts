export type StudentProfile = {
  id: string;
  user_id: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  semester: number;
  section?: string | null;
};

export type AuthSession = {
  user: {
    id: string;
    email: string;
    display_name?: string | null;
    avatar_url?: string | null;
  };
  profile: StudentProfile | null;
  onboarding_required: boolean;
  session_token?: string | null;
};

export type FeatureAccess = {
  academic_intelligence: boolean;
  placement_intelligence: boolean;
  message: string;
};

export type IAMark = {
  assessment_index: number;
  title?: string | null;
  marks_obtained: number;
  max_marks: number;
  assessment_date?: string | null;
};

export type SubjectPayload = {
  name: string;
  code?: string | null;
  max_ia_marks: number;
  attendance_percentage?: number | null;
  ia_marks: IAMark[];
};

export type AcademicRecordPayload = {
  semester: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  previous_cgpa: number;
  previous_sgpa?: number | null;
  attendance_percentage: number;
  weekday_study_hours: number;
  weekend_study_hours: number;
  consistency: string;
  preferred_study_time: string;
  revision_frequency: string;
  study_method: string;
  subjects: SubjectPayload[];
};

export type SubjectAnalysis = {
  subject: string;
  marks: number[];
  percentages: number[];
  average_percentage: number;
  latest_percentage: number;
  trend: "improving" | "declining" | "fluctuating" | "stable" | string;
  normalized_slope: number;
  attendance_percentage: number | null;
  weakness_score: number;
  priority: "High" | "Moderate" | "Low" | string;
  reasons: string[];
};

export type AcademicAnalysis = {
  record_id: string;
  average_ia_percentage: number;
  overall_trend: string;
  subjects: SubjectAnalysis[];
  strongest_subject: string | null;
  weakest_subject: string | null;
  recommendations: string[];
};

export type AcademicPredictionResult = {
  predicted_cgpa: number;
  risk_level: "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk" | string;
  feature_snapshot: Record<string, number>;
  contributing_factors: string[];
  model_version: string;
};

export type TimetableItem = {
  study_date: string;
  subject_name: string;
  start_time: string;
  end_time: string;
  activity: string;
  priority: string;
};

export type TimetableResult = {
  id: string;
  title: string;
  strategy_notes: string;
  items: TimetableItem[];
};

export type TimetableRequestPayload = {
  academic_record_id: string;
  exam_dates: { subject_name: string; exam_date: string }[];
  available_study_hours_per_day: number;
  preferred_start_time: string;
  block_minutes: number;
  include_weekends: boolean;
};

/* Placement Types */
export type PlacementProfile = {
  id?: string;
  user_id?: string;
  cgpa: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  backlog_count: number;
  aptitude_score: number;
  coding_score: number;
  communication_score: number;
  dsa_preparation: string;
  target_role: string;
  programming_languages: string[];
  technical_skills: string[];
};

export type Project = {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  role: string;
  duration: string;
  status: string;
  link?: string | null;
  created_at?: string;
};

export type Internship = {
  id?: string;
  organization: string;
  role: string;
  duration: string;
  technologies: string[];
  responsibilities: string;
  outcomes: string;
  certificate_url?: string | null;
  created_at?: string;
};

export type Certification = {
  id?: string;
  name: string;
  provider: string;
  category: string;
  issue_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  created_at?: string;
};

export type Course = {
  id?: string;
  name: string;
  provider: string;
  category: string;
  completion_status: string;
  completion_date?: string | null;
  credential_url?: string | null;
  created_at?: string;
};

export type AssessmentQuestion = {
  id: string;
  assessment_type: string;
  category: string;
  prompt: string;
  options: string[];
  difficulty: string;
};

export type AssessmentResult = {
  attempt_id: string;
  score: number;
  max_score: number;
  percentage: number;
  category_scores: Record<string, { score: number; max_score: number; percentage: number }>;
};

export type CodingProblem = {
  id: string;
  title: string;
  difficulty: string;
  prompt: string;
  safe_evaluation_notes: string;
  max_score: number;
};

export type CodingResult = {
  attempt_id: string;
  total_score: number;
  execution_result: string;
  review_notes: string[];
};

export type PlacementPredictionResult = {
  placement_probability: number;
  predicted_status: string;
  expected_lpa: number;
  readiness_score: number;
  readiness_dimensions: {
    academics: number;
    aptitude: number;
    coding: number;
    communication: number;
    portfolio: number;
    skills: number;
  };
  interview_stage_readiness: {
    Aptitude: string;
    Coding: string;
    Technical: string;
    "Communication/HR": string;
  };
  skill_gaps: string[];
  recommendations: string[];
  supporting_factors: string[];
  model_version: string;
};

export type CompanyPreparation = {
  company_name: string;
  focus_areas: string[];
  source_label: string;
  source_date: string;
};

export type ReportResult = {
  id: string;
  report_type: string;
  title: string;
  file_path: string;
  download_url: string;
};
