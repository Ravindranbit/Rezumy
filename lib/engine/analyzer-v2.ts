// ============================================================
// Analyzer v2 — Main Orchestrator
//
// The brain of the Repository Intelligence Layer.
// Coordinates all sub-systems:
//   1. Fetch config files + source tree
//   2. Run all parsers
//   3. Verify technologies
//   4. Parse README sections
//   5. Fetch activity metrics
//   6. Compute quality score
//   7. Build structured RepositoryProfile
//   8. Return AnalysisV2Result (backward-compatible)
// ============================================================

import {
  fetchFileContent,
  fetchRepoLanguages,
  fetchRepoTree,
} from "./github-fetcher";
import {
  parsePackageJson,
  parsePythonRequirements,
  parsePipfile,
  parsePomXml,
  parseCargoToml,
  parseGoMod,
  parsePubspecYaml,
  parseDockerfile,
  parseDockerCompose,
  parseGithubActions,
  scanImports,
} from "./parsers";
import { verifyTechnologies, categorizeTechnologies, getVerifiedSkillNames } from "./tech-verifier";
import { parseReadme, extractReadmeSkills } from "./readme-parser";
import { fetchActivityMetrics } from "./activity-fetcher";
import { computeQualityScore } from "./quality-scorer";
import { DEP_TO_SKILL, PROJECT_TYPE_RULES } from "./dep-skill-map";
import { TOPIC_SKILL_MAP } from "@/lib/github-constants";
import type {
  AnalysisV2Result,
  RepositoryProfile,
  ParserResult,
  ArchitectureType,
} from "@/lib/types/repository-profile";

// ─── Architecture Detector ──────────────────────────────────

function detectArchitecture(tree: string[], profile: Partial<RepositoryProfile>): ArchitectureType {
  const paths = tree.map((p) => p.toLowerCase());

  // Microservice signals
  const hasServices = paths.some((p) => p.startsWith("services/") && p.split("/").length > 2);
  const multiDockerfiles = paths.filter((p) => p.includes("dockerfile")).length > 1;
  if (hasServices || multiDockerfiles) return "Microservice";

  // Multi-module signals
  const hasPackages = paths.some((p) => p.startsWith("packages/"));
  const hasApps = paths.some((p) => p.startsWith("apps/"));
  const hasWorkspaces = paths.some((p) => p.includes("lerna.json") || p.includes("pnpm-workspace"));
  if (hasPackages || hasApps || hasWorkspaces) return "Multi-module";

  // AI Pipeline signals
  const aiDirs = ["models/", "training/", "inference/", "notebooks/", "data/"];
  const hasAI = aiDirs.filter((d) => paths.some((p) => p.startsWith(d))).length >= 2;
  if (hasAI || profile.machine_learning) return "AI Pipeline";

  // Full Stack signals (both frontend and backend)
  const hasFrontend = paths.some(
    (p) => p.includes("components/") || p.includes("pages/") || p.includes("app/")
  );
  const hasBackend = paths.some(
    (p) => p.includes("api/") || p.includes("routes/") || p.includes("controllers/")
  );
  if (hasFrontend && hasBackend) return "Full Stack";

  // CLI signals
  const hasCli = paths.some(
    (p) => p.includes("cli/") || p.includes("bin/") || p.includes("commands/")
  );
  if (hasCli) return "CLI";

  // Library signals
  const hasLib = paths.some(
    (p) => p.startsWith("src/") && !hasFrontend && !hasBackend
  );
  if (hasLib && !hasFrontend && !hasBackend) return "Library";

  return "Monolith";
}

// ─── Complexity Calculator ──────────────────────────────────

function calculateComplexity(
  profile: Partial<RepositoryProfile>,
  tree: string[],
  languageCount: number
): number {
  let complexity = 1;

  // Languages
  complexity += Math.min(languageCount, 5) * 0.5;

  // Frameworks
  complexity += Math.min((profile.frameworks?.length || 0), 4) * 0.5;

  // Databases
  if ((profile.databases?.length || 0) > 0) complexity += 1;

  // Cloud services
  if ((profile.cloud?.length || 0) > 0) complexity += 0.5;

  // Deployment
  if ((profile.deployment?.length || 0) > 0) complexity += 0.5;

  // Testing
  if (profile.testing) complexity += 0.5;

  // Architecture
  const archBonus: Record<ArchitectureType, number> = {
    Microservice: 2,
    "Multi-module": 1.5,
    "AI Pipeline": 1.5,
    "Full Stack": 1,
    Monolith: 0,
    CLI: 0,
    Library: 0,
    Unknown: 0,
  };
  complexity += archBonus[profile.architecture || "Unknown"] || 0;

  // File count
  const fileCount = tree.length;
  if (fileCount > 200) complexity += 1;
  else if (fileCount > 50) complexity += 0.5;

  return Math.min(Math.round(complexity * 10) / 10, 10);
}

// ─── Project Type Classifier (backward compat) ──────────────

function classifyProjectType(
  allSkills: string[],
  topics: string[],
  description: string,
  repoName: string
): string {
  const lower = [
    ...allSkills.map((s) => s.toLowerCase()),
    ...topics.map((t) => t.toLowerCase()),
    description.toLowerCase(),
    repoName.toLowerCase(),
  ].join(" ");

  const scores: Record<string, number> = {};
  for (const rule of PROJECT_TYPE_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > 0) {
      scores[rule.type] = (scores[rule.type] || 0) + score;
    }
  }

  const hasFrontend = (scores["Frontend Web App"] || 0) > 0;
  const hasBackend = (scores["Backend / API"] || 0) > 0;
  if (hasFrontend && hasBackend) return "Full-Stack Web App";

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "Software Project";
}

// ─── HR Description Generator (backward compat) ─────────────

function generateHRDescription(params: {
  name: string;
  projectType: string;
  skills: string[];
  description: string;
  languages: string[];
}): string {
  const { name, projectType, skills, description, languages } = params;
  const title = name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const bullets: string[] = [];

  if (description) {
    bullets.push(description);
  } else {
    bullets.push(`${projectType} — ${title}`);
  }

  if (languages.length > 0) {
    bullets.push(`Written in ${languages.slice(0, 3).join(", ")}`);
  }

  const frameworks = skills.filter((s) =>
    [
      "React", "Vue.js", "Angular", "Next.js", "Django", "Flask", "FastAPI",
      "Spring Boot", "Express.js", "NestJS", "Flutter", "Svelte", "Nuxt.js",
    ].includes(s)
  );
  if (frameworks.length > 0) {
    bullets.push(`Built with ${frameworks.join(", ")}`);
  }

  const databases = skills.filter((s) =>
    ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase", "Firebase"].includes(s)
  );
  if (databases.length > 0) {
    bullets.push(`Data persistence with ${databases.join(", ")}`);
  }

  const infra = skills.filter((s) =>
    [
      "Docker", "Kubernetes", "GitHub Actions", "AWS", "Azure",
      "Google Cloud", "Terraform", "Vercel", "Nginx",
    ].includes(s)
  );
  if (infra.length > 0) {
    bullets.push(`Deployed / managed with ${infra.join(", ")}`);
  }

  return bullets.join("\n");
}

// ─── Main Analyzer ──────────────────────────────────────────

export async function analyzeRepositoryV2(
  token: string,
  fullName: string,
  repoData: {
    language: string;
    topics: string[];
    description: string;
    name: string;
    stars?: number;
  }
): Promise<AnalysisV2Result> {
  const [owner, repo] = fullName.split("/");

  // ── Step 1: Fetch languages + config files + tree in parallel ──

  const [
    languages,
    packageJson,
    requirements,
    pipfile,
    pomXml,
    cargoToml,
    pubspec,
    goMod,
    dockerComposeContent,
    dockerfileContent,
    readmeContent,
    tree,
  ] = await Promise.all([
    fetchRepoLanguages(token, owner, repo),
    fetchFileContent(token, owner, repo, "package.json"),
    fetchFileContent(token, owner, repo, "requirements.txt"),
    fetchFileContent(token, owner, repo, "Pipfile"),
    fetchFileContent(token, owner, repo, "pom.xml"),
    fetchFileContent(token, owner, repo, "Cargo.toml"),
    fetchFileContent(token, owner, repo, "pubspec.yaml"),
    fetchFileContent(token, owner, repo, "go.mod"),
    fetchFileContent(token, owner, repo, "docker-compose.yml").then(
      (r) => r || fetchFileContent(token, owner, repo, "docker-compose.yaml")
    ),
    fetchFileContent(token, owner, repo, "Dockerfile"),
    fetchFileContent(token, owner, repo, "README.md").then(
      (r) => r || fetchFileContent(token, owner, repo, "readme.md")
    ),
    fetchRepoTree(token, owner, repo),
  ]);

  // Fetch GitHub Actions workflow
  const workflow = await fetchFileContent(token, owner, repo, ".github/workflows/main.yml")
    .then((r) => r || fetchFileContent(token, owner, repo, ".github/workflows/deploy.yml"))
    .then((r) => r || fetchFileContent(token, owner, repo, ".github/workflows/ci.yml"))
    .then((r) => r || fetchFileContent(token, owner, repo, ".github/workflows/build.yml"));

  // ── Step 2: Run all parsers ──

  const parserResults: ParserResult[] = [];

  if (packageJson) parserResults.push(parsePackageJson(packageJson));
  if (requirements) parserResults.push(parsePythonRequirements(requirements));
  if (pipfile) parserResults.push(parsePipfile(pipfile));
  if (pomXml) parserResults.push(parsePomXml(pomXml));
  if (cargoToml) parserResults.push(parseCargoToml(cargoToml));
  if (pubspec) parserResults.push(parsePubspecYaml(pubspec));
  if (goMod) parserResults.push(parseGoMod(goMod));
  if (dockerfileContent) parserResults.push(parseDockerfile(dockerfileContent));
  if (dockerComposeContent) parserResults.push(parseDockerCompose(dockerComposeContent));
  if (workflow) parserResults.push(parseGithubActions(workflow));

  // ── Step 3: Import scanner (code-level verification) ──

  const importResult = await scanImports(token, owner, repo);
  parserResults.push(importResult);

  // ── Step 4: README parsing ──

  const readmeSections = readmeContent ? parseReadme(readmeContent) : {
    features: [],
    architecture: [],
    apis: [],
    deployment: [],
    tech_stack: [],
    installation: [],
    raw_content: "",
  };

  const readmeSkills = readmeContent ? extractReadmeSkills(readmeContent, DEP_TO_SKILL) : [];

  // ── Step 5: Topic-based skills ──

  const topicSkills: string[] = [];
  for (const topic of repoData.topics) {
    const mapped = TOPIC_SKILL_MAP[topic.toLowerCase()];
    if (mapped) topicSkills.push(mapped);
  }

  // ── Step 6: Verify technologies ──

  const verifiedTechs = verifyTechnologies(parserResults, readmeSkills, topicSkills);
  const categories = categorizeTechnologies(verifiedTechs);
  const verifiedSkillNames = getVerifiedSkillNames(verifiedTechs);

  // Add language-based skills (high confidence — from GitHub API)
  const languageNames = Object.keys(languages);
  for (const lang of languageNames) {
    if (!verifiedSkillNames.includes(lang)) {
      verifiedSkillNames.push(lang);
    }
  }

  // ── Step 7: Build RepositoryProfile ──

  const treePaths = tree.map((t) => t.path);

  const profile: RepositoryProfile = {
    project_name: repoData.name,
    category: classifyProjectType(verifiedSkillNames, repoData.topics, repoData.description, repoData.name),
    languages: languageNames,
    language_bytes: languages,
    frameworks: categories.frameworks,
    databases: categories.databases,
    cloud: categories.cloud,
    deployment: categories.deployment,
    testing: categories.testing.length > 0,
    test_frameworks: categories.testing,
    api_present: importResult.hasApi || readmeSections.apis.length > 0,
    authentication: importResult.hasAuth,
    machine_learning: categories.ml_ai.length > 0,
    architecture: "Unknown",
    complexity_score: 0,
  };

  // Detect architecture & complexity
  profile.architecture = detectArchitecture(treePaths, profile);
  profile.complexity_score = calculateComplexity(profile, treePaths, languageNames.length);

  // ── Step 8: Fetch activity metrics ──

  const activityMetrics = await fetchActivityMetrics(token, owner, repo);

  // ── Step 9: Compute quality score ──

  const quality = computeQualityScore({
    profile,
    readme: readmeSections,
    activity: activityMetrics,
    stars: repoData.stars || 0,
    forks: activityMetrics.forks,
    tree: treePaths,
  });

  // ── Step 10: Build backward-compatible fields ──

  const projectType = profile.category;
  const techStack = verifiedSkillNames.join(", ");
  const enhancedDescription = generateHRDescription({
    name: repoData.name,
    projectType,
    skills: verifiedSkillNames,
    description: repoData.description,
    languages: languageNames,
  });

  return {
    profile,
    verifiedTechs,
    readmeSections,
    activityMetrics,
    quality,
    // Legacy-compatible flat fields
    skills: verifiedSkillNames,
    projectType,
    techStack,
    enhancedDescription,
  };
}
