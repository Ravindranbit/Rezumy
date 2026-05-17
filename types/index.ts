// ============================================================
// Rezumy — TypeScript Type Definitions
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  githubUsername?: string | null;
  githubId?: string | null;
}

export interface ProfileData {
  id?: string;
  phone: string;
  location: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}

export interface EducationEntry {
  id?: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ExperienceEntry {
  id?: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface SkillEntry {
  id?: string;
  name: string;
}

export interface ProjectEntry {
  id?: string;
  title: string;
  description: string;
  techStack: string;
  source?: string; // "manual" | "github"
}

export interface ResumeData {
  id?: string;
  title: string;
  summary: string;
  createdAt?: string;
  updatedAt?: string;
}

// Combined resume preview data (profile + resume merged)
export interface ResumePreviewData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth form types
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// GitHub types
export interface GitHubRepoData {
  id: string;
  repoId: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  topics: string[];
  url: string;
  stars: number;
  repoUpdatedAt: string;
  isSelected: boolean;
  // Deep analysis results
  analyzedSkills: string[];
  projectType: string;
  techStack: string;
}

export interface JobListing {
  title: string;
  company: string;
  link: string;
  snippet: string;
  source: string;
  date?: string;
  matchScore: number;
  reason: string;
}
