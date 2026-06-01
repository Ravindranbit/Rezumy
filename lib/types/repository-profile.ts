// ============================================================
// Rezumy v2 — Repository Intelligence Types
// Structured types for the v2 analysis engine.
// Every repo becomes a rich, verified profile — not raw text.
// ============================================================

// ─── Architecture Classification ────────────────────────────

export type ArchitectureType =
  | "Monolith"
  | "Multi-module"
  | "Microservice"
  | "AI Pipeline"
  | "Full Stack"
  | "CLI"
  | "Library"
  | "Unknown";

// ─── Repository Profile (Source of Truth) ───────────────────

export interface RepositoryProfile {
  project_name: string;
  category: string; // "AI SaaS", "CLI Tool", "Full-Stack Web App", etc.
  languages: string[]; // From GitHub Languages API
  language_bytes: Record<string, number>; // Language → bytes (for dominance)
  frameworks: string[]; // From dependency files
  databases: string[]; // From docker-compose, deps
  cloud: string[]; // AWS, GCP, Azure, etc.
  deployment: string[]; // Docker, K8s, Terraform
  testing: boolean; // Test framework detected
  test_frameworks: string[]; // jest, pytest, cypress, etc.
  api_present: boolean; // REST/GraphQL endpoints detected
  authentication: boolean; // Auth libs detected
  machine_learning: boolean; // ML/AI libs detected
  architecture: ArchitectureType;
  complexity_score: number; // 1–10
}

// ─── Technology Verification ────────────────────────────────

export type ConfidenceLevel = "high" | "medium" | "low";

export interface VerifiedTechnology {
  technology: string;
  confidence: ConfidenceLevel;
  sources: string[]; // Which files confirmed this tech
}

// ─── Parser Result (common shape for all file parsers) ──────

export interface ParserResult {
  skills: string[];
  rawDeps: string[]; // Raw dependency names before mapping
  source: string; // File that was parsed, e.g. "package.json"
}

// ─── README Sections ────────────────────────────────────────

export interface ReadmeSections {
  features: string[];
  architecture: string[];
  apis: string[];
  deployment: string[];
  tech_stack: string[];
  installation: string[];
  raw_content: string;
}

// ─── Activity Metrics ───────────────────────────────────────

export interface ActivityMetrics {
  commits_last_90_days: number;
  total_commits: number;
  contributors: number;
  last_update: string;
  releases: number;
  active: boolean; // Updated in last 6 months
  open_issues: number;
  forks: number;
}

// ─── Quality Scoring ────────────────────────────────────────

export interface QualityBreakdown {
  code_quality: number; // 0–100 (weight: 20%)
  architecture: number; // 0–100 (weight: 20%)
  documentation: number; // 0–100 (weight: 15%)
  activity: number; // 0–100 (weight: 15%)
  testing: number; // 0–100 (weight: 10%)
  deployment_readiness: number; // 0–100 (weight: 10%)
  popularity: number; // 0–100 (weight: 10%)
}

export type QualityGrade = "A" | "B" | "C" | "D" | "F";

export interface QualityResult {
  score: number; // 0–100 weighted total
  grade: QualityGrade;
  breakdown: QualityBreakdown;
}

// ─── Enriched Project (output for resume/UI) ────────────────

export interface EnrichedProject {
  project_id: string;
  title: string;
  description: string;
  category: string;
  skills: string[]; // Verified only
  tech_stack: string[];
  resume_bullets: string[]; // Generated later by LLM (Phase 2)
  quality_score: number;
  quality_grade: QualityGrade;
  relevance_score?: number; // Set after JD matching (Phase 2)
  source: "github";
  url: string;
  architecture: ArchitectureType;
  is_production_ready: boolean;
}

// ─── Full Analysis Result (returned by analyzer-v2) ─────────

export interface AnalysisV2Result {
  profile: RepositoryProfile;
  verifiedTechs: VerifiedTechnology[];
  readmeSections: ReadmeSections;
  activityMetrics: ActivityMetrics;
  quality: QualityResult;
  // Legacy-compatible flat fields for backward compat
  skills: string[];
  projectType: string;
  techStack: string;
  enhancedDescription: string;
}
