// ── Profile ────────────────────────────────────────────────────────────────

export interface Contact {
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface LockedData {
  name: string;
  contact: Contact;
  education: Education[];
}

export interface ExperienceEntry {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  bullets: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  tech_stack?: string;
  bullets: string[];
}

export interface EditableData {
  summary: string;
  skills: string[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
}

export interface Profile {
  id: number;
  profile_id: string;
  locked_data: LockedData;
  editable_data: EditableData;
  created_at: string;
  updated_at: string;
}

// ── Diff ───────────────────────────────────────────────────────────────────

export type DiffLineType = "unchanged" | "removed" | "added";

export interface DiffLine {
  type: DiffLineType;
  content: string;
}

export interface TextDiff {
  original: string;
  modified: string;
  changed: boolean;
  lines: DiffLine[];
}

export interface SkillsDiff {
  added: string[];
  removed: string[];
  unchanged: string[];
  changed: boolean;
}

export interface ExperienceDiff {
  company: string;
  role: string;
  changed: boolean;
  bullets: DiffLine[];
}

export interface ProjectDiff {
  name: string;
  changed: boolean;
  description: TextDiff;
  bullets: DiffLine[];
}

export interface DiffSnapshot {
  summary: TextDiff;
  skills: SkillsDiff;
  experience: ExperienceDiff[];
  projects: ProjectDiff[];
}

// ── ProfileVersion ─────────────────────────────────────────────────────────

export type VersionStatus = "draft" | "reviewed" | "exported";

export interface ProfileVersion {
  id: number;
  profile: number;
  job_title: string;
  company: string;
  jd_text: string;
  original_editable: EditableData;
  tailored_editable: EditableData;
  diff_snapshot: DiffSnapshot;
  final_editable: EditableData | null;
  pdf_path: string;
  status: VersionStatus;
  created_at: string;
}

// ── Application ────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "offered"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: number;
  profile_id: string;
  version: number;
  job_title: string;
  company: string;
  date_applied: string;
  pdf_path: string;
  status: ApplicationStatus;
  notes: string;
  diff_snapshot: DiffSnapshot;
  created_at: string;
}

// ── Paginated response ─────────────────────────────────────────────────────

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
