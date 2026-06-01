// ============================================================
// Repository Quality Scorer
//
// Computes a 0–100 quality score with a letter grade (A–F).
//
// Scoring Formula:
//   Code Quality          20%
//   Architecture          20%
//   Documentation         15%
//   Activity              15%
//   Testing               10%
//   Deployment Readiness  10%
//   Popularity            10%
// ============================================================

import type {
  RepositoryProfile,
  ReadmeSections,
  ActivityMetrics,
  QualityBreakdown,
  QualityResult,
  QualityGrade,
  ArchitectureType,
} from "@/lib/types/repository-profile";

// ─── Individual Scoring Functions ────────────────────────────

/**
 * Code Quality Score (0–100)
 * Based on: language count, typed language use, linting config, ORM usage
 */
function scoreCodeQuality(profile: RepositoryProfile, tree: string[]): number {
  let score = 30; // Base score — the repo exists

  // Multiple languages = more complex project
  const langCount = profile.languages.length;
  if (langCount >= 3) score += 15;
  else if (langCount >= 2) score += 10;
  else if (langCount >= 1) score += 5;

  // Typed languages bonus (TypeScript, Java, Go, Rust, Kotlin)
  const typedLangs = ["TypeScript", "Java", "Go", "Rust", "Kotlin", "C#", "Swift"];
  if (profile.languages.some((l) => typedLangs.includes(l))) score += 15;

  // Linting/formatting config
  const lintFiles = [
    ".eslintrc", ".eslintrc.js", ".eslintrc.json", "eslint.config",
    ".prettierrc", ".prettierrc.js", "prettier.config",
    "pylintrc", ".pylintrc", ".flake8", "setup.cfg", "pyproject.toml",
    ".rubocop.yml", ".golangci.yml",
  ];
  if (tree.some((f) => lintFiles.some((lf) => f.toLowerCase().includes(lf.toLowerCase())))) {
    score += 15;
  }

  // ORM/database abstraction usage
  if (profile.databases.length > 0) score += 10;

  // Frameworks indicate structured code
  if (profile.frameworks.length > 0) score += 15;

  return Math.min(score, 100);
}

/**
 * Architecture Score (0–100)
 * Based on: architecture type, directory structure complexity
 */
function scoreArchitecture(
  profile: RepositoryProfile,
  tree: string[]
): number {
  let score = 20;

  // Architecture type bonus
  const archScores: Record<ArchitectureType, number> = {
    Microservice: 30,
    "Full Stack": 25,
    "AI Pipeline": 25,
    "Multi-module": 20,
    Monolith: 10,
    CLI: 10,
    Library: 10,
    Unknown: 0,
  };
  score += archScores[profile.architecture] || 0;

  // Directory depth indicates structure
  const maxDepth = Math.max(...tree.map((f) => f.split("/").length), 0);
  if (maxDepth >= 5) score += 15;
  else if (maxDepth >= 3) score += 10;
  else if (maxDepth >= 2) score += 5;

  // Has src/lib/components separation
  const structuralDirs = ["src", "lib", "components", "services", "models", "controllers", "utils", "helpers"];
  const dirCount = structuralDirs.filter((d) =>
    tree.some((f) => f.startsWith(d + "/") || f.includes("/" + d + "/"))
  ).length;
  if (dirCount >= 3) score += 20;
  else if (dirCount >= 2) score += 15;
  else if (dirCount >= 1) score += 10;

  // Config files indicate mature setup
  const configPatterns = [".env.example", "tsconfig", "webpack.config", "vite.config", "next.config"];
  const configCount = configPatterns.filter((p) =>
    tree.some((f) => f.toLowerCase().includes(p.toLowerCase()))
  ).length;
  score += Math.min(configCount * 5, 15);

  return Math.min(score, 100);
}

/**
 * Documentation Score (0–100)
 * Based on: README quality, section coverage, comments presence
 */
function scoreDocumentation(readme: ReadmeSections, tree: string[]): number {
  let score = 0;

  // README exists and has content
  if (readme.raw_content.length > 0) score += 15;
  if (readme.raw_content.length > 500) score += 10;
  if (readme.raw_content.length > 2000) score += 10;

  // Section coverage
  const sectionScores: Record<string, number> = {
    features: 10,
    architecture: 10,
    apis: 10,
    deployment: 10,
    tech_stack: 10,
    installation: 10,
  };

  for (const [section, points] of Object.entries(sectionScores)) {
    const items = readme[section as keyof Omit<ReadmeSections, "raw_content">];
    if (Array.isArray(items) && items.length > 0) {
      score += points;
    }
  }

  // Additional docs directory
  if (tree.some((f) => f.startsWith("docs/") || f.startsWith("documentation/"))) {
    score += 10;
  }

  // CONTRIBUTING, LICENSE, CHANGELOG
  const docFiles = ["contributing", "license", "changelog", "code_of_conduct"];
  for (const doc of docFiles) {
    if (tree.some((f) => f.toLowerCase().includes(doc))) {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Activity Score (0–100)
 * Based on: commit frequency, recency, contributors
 */
function scoreActivity(metrics: ActivityMetrics): number {
  let score = 0;

  // Commit frequency (last 90 days)
  if (metrics.commits_last_90_days > 50) score += 30;
  else if (metrics.commits_last_90_days > 20) score += 25;
  else if (metrics.commits_last_90_days > 5) score += 15;
  else if (metrics.commits_last_90_days > 0) score += 5;

  // Recency
  if (metrics.active) score += 25;

  // Contributors
  if (metrics.contributors > 5) score += 20;
  else if (metrics.contributors > 2) score += 15;
  else if (metrics.contributors > 1) score += 10;
  else score += 5; // Solo project still gets some credit

  // Releases
  if (metrics.releases > 5) score += 15;
  else if (metrics.releases > 1) score += 10;
  else if (metrics.releases > 0) score += 5;

  // Total commits
  if (metrics.total_commits > 200) score += 10;
  else if (metrics.total_commits > 50) score += 5;

  return Math.min(score, 100);
}

/**
 * Testing Score (0–100)
 * Based on: test framework presence, test files, coverage config
 */
function scoreTesting(profile: RepositoryProfile, tree: string[]): number {
  let score = 0;

  // Test framework detected
  if (profile.testing) score += 30;

  // Specific test frameworks get more points
  if (profile.test_frameworks.length > 1) score += 15;
  else if (profile.test_frameworks.length === 1) score += 10;

  // Test files present
  const testPatterns = [
    "test/", "tests/", "__tests__/", "spec/",
    ".test.", ".spec.", "_test.", "_spec.",
    "test_", "spec_",
  ];
  const testFileCount = tree.filter((f) =>
    testPatterns.some((p) => f.toLowerCase().includes(p))
  ).length;

  if (testFileCount > 10) score += 25;
  else if (testFileCount > 5) score += 20;
  else if (testFileCount > 0) score += 10;

  // Coverage config
  const coverageFiles = [
    "coverage", "lcov.info", ".nycrc", "jest.config",
    "vitest.config", "pytest.ini", "setup.cfg", ".coveragerc",
    "codecov.yml",
  ];
  if (tree.some((f) => coverageFiles.some((c) => f.toLowerCase().includes(c)))) {
    score += 15;
  }

  // E2E testing bonus
  const e2eFrameworks = ["Playwright", "Cypress"];
  if (profile.test_frameworks.some((f) => e2eFrameworks.includes(f))) {
    score += 15;
  }

  return Math.min(score, 100);
}

/**
 * Deployment Readiness Score (0–100)
 * Based on: Dockerfile, CI/CD, cloud config, production readiness
 */
function scoreDeploymentReadiness(profile: RepositoryProfile, tree: string[]): number {
  let score = 0;

  // Docker
  if (profile.deployment.includes("Docker")) score += 20;

  // Docker Compose
  if (tree.some((f) => f.toLowerCase().includes("docker-compose"))) score += 10;

  // CI/CD
  if (profile.deployment.includes("GitHub Actions")) score += 20;
  if (tree.some((f) => f.includes(".github/workflows/"))) score += 5;

  // Kubernetes
  if (profile.deployment.includes("Kubernetes")) score += 15;
  if (tree.some((f) => f.includes("k8s/") || f.includes("kubernetes/"))) score += 5;

  // Terraform/IaC
  if (profile.deployment.includes("Terraform")) score += 15;

  // Cloud provider
  if (profile.cloud.length > 0) score += 15;

  // Environment config
  if (tree.some((f) => f.includes(".env.example") || f.includes(".env.sample"))) {
    score += 10;
  }

  // Nginx/reverse proxy config
  if (tree.some((f) => f.toLowerCase().includes("nginx"))) score += 5;

  return Math.min(score, 100);
}

/**
 * Popularity Score (0–100)
 * Based on: stars, forks, watchers
 */
function scorePopularity(stars: number, forks: number): number {
  let score = 0;

  // Stars
  if (stars > 1000) score += 40;
  else if (stars > 100) score += 30;
  else if (stars > 10) score += 20;
  else if (stars > 0) score += 10;

  // Forks
  if (forks > 100) score += 30;
  else if (forks > 20) score += 20;
  else if (forks > 5) score += 15;
  else if (forks > 0) score += 10;

  // Base credit for having a public repo
  score += 20;

  return Math.min(score, 100);
}

// ─── Grade Calculator ────────────────────────────────────────

function calculateGrade(score: number): QualityGrade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

// ─── Main Scoring Function ──────────────────────────────────

/**
 * Compute the overall quality score for a repository.
 */
export function computeQualityScore(params: {
  profile: RepositoryProfile;
  readme: ReadmeSections;
  activity: ActivityMetrics;
  stars: number;
  forks: number;
  tree: string[];
}): QualityResult {
  const { profile, readme, activity, stars, forks, tree } = params;

  const breakdown: QualityBreakdown = {
    code_quality: scoreCodeQuality(profile, tree),
    architecture: scoreArchitecture(profile, tree),
    documentation: scoreDocumentation(readme, tree),
    activity: scoreActivity(activity),
    testing: scoreTesting(profile, tree),
    deployment_readiness: scoreDeploymentReadiness(profile, tree),
    popularity: scorePopularity(stars, forks),
  };

  // Weighted total
  const weights = {
    code_quality: 0.2,
    architecture: 0.2,
    documentation: 0.15,
    activity: 0.15,
    testing: 0.1,
    deployment_readiness: 0.1,
    popularity: 0.1,
  };

  const score = Math.round(
    Object.entries(weights).reduce(
      (sum, [key, weight]) => sum + breakdown[key as keyof QualityBreakdown] * weight,
      0
    )
  );

  return {
    score,
    grade: calculateGrade(score),
    breakdown,
  };
}
