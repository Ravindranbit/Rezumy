// ============================================================
// GitHub API utilities — OAuth, repo fetching, project transformation
// ============================================================

import { encrypt, decrypt } from "./crypto";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── OAuth ──────────────────────────────────────────────

/**
 * Build the GitHub OAuth authorization URL.
 * @param state CSRF token to verify on callback
 * @param scope "public_repo" for public only, "repo" for private too
 */
export function getGitHubAuthUrl(state: string, scope = "public_repo"): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/github/callback`,
    scope,
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange a temporary OAuth code for an access token.
 */
export async function exchangeCodeForToken(
  code: string
): Promise<string | null> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const data = await res.json();
  return data.access_token || null;
}

/**
 * Encrypt a GitHub token for database storage.
 */
export function encryptToken(token: string): string {
  return encrypt(token);
}

/**
 * Decrypt a GitHub token from database storage.
 */
export function decryptToken(encryptedToken: string): string {
  return decrypt(encryptedToken);
}

// ─── GitHub API ─────────────────────────────────────────

interface GitHubUser {
  id: number;
  login: string;
}

interface GitHubApiRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  html_url: string;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
}

/**
 * Fetch the authenticated GitHub user.
 */
export async function fetchGitHubUser(token: string): Promise<GitHubUser | null> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetch all repositories for the authenticated user (paginated).
 * Filters out forks and returns up to 100 repos.
 */
export async function fetchGitHubRepos(
  token: string
): Promise<GitHubApiRepo[]> {
  const allRepos: GitHubApiRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (page <= 3) {
    // Max 300 repos to avoid rate limits
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!res.ok) break;
    const repos: GitHubApiRepo[] = await res.json();
    if (repos.length === 0) break;

    allRepos.push(...repos.filter((r) => !r.fork)); // Skip forks
    if (repos.length < perPage) break;
    page++;
  }

  return allRepos;
}

// ─── Smart Project Transformation ───────────────────────

/**
 * Convert a GitHub repo name into a human-readable title.
 * e.g., "my-cool-app" → "My Cool App"
 */
function humanizeRepoName(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

import { LANGUAGE_SKILL_MAP, TOPIC_SKILL_MAP } from "./github-constants";
export { LANGUAGE_SKILL_MAP, TOPIC_SKILL_MAP };

/**
 * Detect keywords in the repo description to generate resume-quality bullets.
 */
function generateSmartDescription(
  name: string,
  description: string,
  language: string,
  topics: string[],
  techStack: string
): string {
  const bullets: string[] = [];

  const desc = (description || "").toLowerCase();
  const allTopics = topics.map((t) => t.toLowerCase());

  // Main bullet — what was built
  const title = humanizeRepoName(name);
  if (techStack) {
    bullets.push(`Built ${title} using ${techStack}`);
  } else {
    bullets.push(`Developed ${title}${language ? ` with ${language}` : ""}`);
  }

  // Keyword-based intelligence
  if (
    desc.includes("api") ||
    desc.includes("rest") ||
    allTopics.includes("rest-api") ||
    allTopics.includes("graphql")
  ) {
    bullets.push("Designed and implemented RESTful API endpoints for data access and manipulation");
  }

  if (
    desc.includes("ui") ||
    desc.includes("frontend") ||
    desc.includes("interface") ||
    allTopics.includes("react") ||
    allTopics.includes("vue") ||
    allTopics.includes("nextjs")
  ) {
    bullets.push("Developed responsive user interface with modern frontend frameworks");
  }

  if (
    desc.includes("database") ||
    desc.includes("db") ||
    desc.includes("sql") ||
    allTopics.includes("mongodb") ||
    allTopics.includes("postgresql") ||
    allTopics.includes("prisma")
  ) {
    bullets.push("Integrated database systems for persistent data storage and retrieval");
  }

  if (
    desc.includes("auth") ||
    desc.includes("login") ||
    desc.includes("jwt") ||
    desc.includes("oauth")
  ) {
    bullets.push("Implemented secure authentication and authorization mechanisms");
  }

  if (
    desc.includes("deploy") ||
    desc.includes("ci") ||
    desc.includes("cd") ||
    allTopics.includes("docker") ||
    allTopics.includes("kubernetes")
  ) {
    bullets.push("Configured deployment pipelines and containerized services");
  }

  if (
    desc.includes("test") ||
    desc.includes("testing") ||
    allTopics.includes("jest") ||
    allTopics.includes("testing")
  ) {
    bullets.push("Wrote comprehensive tests to ensure code quality and reliability");
  }

  // If we only got the main bullet, add a generic one from description
  if (bullets.length === 1 && description) {
    bullets.push(description);
  }

  return bullets.join("\n");
}

/**
 * Build a tech stack string from language and topics.
 */
function buildTechStack(language: string, topics: string[]): string {
  const techs: string[] = [];

  // Add primary language
  if (language) techs.push(language);

  // Map topics to recognizable tech names
  for (const topic of topics) {
    const mapped = TOPIC_SKILL_MAP[topic.toLowerCase()];
    if (mapped && !techs.includes(mapped)) {
      techs.push(mapped);
    }
  }

  return techs.join(", ");
}

/**
 * Transform a GitHubRepo database record into a resume-ready project.
 * If v2 analysis data is available, returns an EnrichedProject with
 * quality scores, verified skills, and structured metadata.
 */
export function transformRepoToProject(repo: {
  id?: string;
  name: string;
  description: string;
  language: string;
  topics: string[] | unknown;
  url: string;
  stars: number;
  // v2 fields (optional — may not be analyzed yet)
  projectProfile?: Record<string, unknown> | null;
  qualityScore?: number;
  qualityGrade?: string;
  verifiedTechs?: Array<{ technology: string; confidence: string; sources: string[] }> | null;
}) {
  const topics = Array.isArray(repo.topics) ? repo.topics as string[] : [];
  const techStack = buildTechStack(repo.language, topics);

  // If v2 analysis data is available, return EnrichedProject
  const profile = repo.projectProfile as Record<string, unknown> | null;
  if (profile && repo.qualityScore !== undefined && repo.qualityScore > 0) {
    const verifiedSkills = Array.isArray(repo.verifiedTechs)
      ? repo.verifiedTechs.map((v) => v.technology)
      : [];

    return {
      project_id: repo.id || "",
      title: humanizeRepoName(repo.name),
      description: generateSmartDescription(
        repo.name,
        repo.description,
        repo.language,
        topics,
        verifiedSkills.join(", ") || techStack
      ),
      category: (profile.category as string) || "Software Project",
      skills: verifiedSkills,
      tech_stack: verifiedSkills.length > 0 ? verifiedSkills : techStack.split(", ").filter(Boolean),
      resume_bullets: [] as string[], // Populated in Phase 2
      quality_score: repo.qualityScore,
      quality_grade: (repo.qualityGrade || "F") as "A" | "B" | "C" | "D" | "F",
      relevance_score: undefined as number | undefined, // Set after JD matching (Phase 2)
      source: "github" as const,
      url: repo.url,
      architecture: (profile.architecture as string) || "Unknown",
      is_production_ready:
        Boolean(profile.deployment && (profile.deployment as string[]).length > 0) &&
        Boolean(profile.testing),
      // Legacy compat
      techStack: verifiedSkills.join(", ") || techStack,
    };
  }

  // Fallback: no v2 analysis — return legacy format
  return {
    title: humanizeRepoName(repo.name),
    description: generateSmartDescription(
      repo.name,
      repo.description,
      repo.language,
      topics,
      techStack
    ),
    techStack,
    source: "github" as const,
  };
}

/**
 * Extract unique skills from a list of repos based on languages and topics.
 */
export function extractSkillsFromRepos(
  repos: Array<{ language: string; topics: string[] | unknown }>
): string[] {
  const skillSet = new Set<string>();

  for (const repo of repos) {
    // Language → skills
    if (repo.language && LANGUAGE_SKILL_MAP[repo.language]) {
      LANGUAGE_SKILL_MAP[repo.language].forEach((s) => skillSet.add(s));
    }

    // Topics → skills
    const topics = Array.isArray(repo.topics) ? repo.topics as string[] : [];
    for (const topic of topics) {
      const mapped = TOPIC_SKILL_MAP[topic.toLowerCase()];
      if (mapped) skillSet.add(mapped);
    }
  }

  return Array.from(skillSet);
}

/**
 * Auto-select the best repos based on stars, recency, and having a description.
 * Returns repo IDs that should be auto-selected.
 */
export function getAutoSelectRepoIds(
  repos: Array<{
    repoId: number;
    stars: number;
    description: string;
    repoUpdatedAt: string;
  }>,
  maxSelect = 5
): number[] {
  // Score each repo
  const scored = repos.map((r) => {
    let score = 0;
    score += r.stars * 3; // Stars are strong signal
    score += r.description ? 5 : 0; // Has description = good
    // Recency bonus: repos updated in last 6 months get a boost
    const updatedDate = new Date(r.repoUpdatedAt);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (updatedDate > sixMonthsAgo) score += 3;
    return { repoId: r.repoId, score };
  });

  // Sort by score descending and pick top N
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxSelect).map((r) => r.repoId);
}
