// ============================================================
// GitHub API Helpers for the v2 Engine
// Shared fetch utilities for file content, tree, and stats.
// ============================================================

const GITHUB_API = "https://api.github.com";

/**
 * Standard headers for authenticated GitHub API requests.
 */
function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };
}

/**
 * Fetch a single file's decoded content from a repository.
 * Returns null if the file doesn't exist or isn't a regular file.
 */
export async function fetchFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // GitHub returns an array when `path` is a directory — bail out
    if (Array.isArray(data)) return null;
    if (!data || !data.content || data.type !== "file") return null;
    if (data.encoding === "base64") {
      return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch languages breakdown from the GitHub Languages API.
 * Returns { "TypeScript": 50000, "JavaScript": 12000, ... }
 */
export async function fetchRepoLanguages(
  token: string,
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/languages`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

/**
 * Fetch the recursive file tree for a repository.
 * Returns an array of { path, type, size } for every file/dir.
 */
export async function fetchRepoTree(
  token: string,
  owner: string,
  repo: string,
  branch = "HEAD"
): Promise<Array<{ path: string; type: string; size?: number }>> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tree || []).map((item: any) => ({
      path: item.path as string,
      type: item.type as string,
      size: item.size as number | undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch weekly commit activity for the past year (52 weeks).
 * Returns an array of { week_unix, total_commits } per week.
 */
export async function fetchCommitActivity(
  token: string,
  owner: string,
  repo: string
): Promise<Array<{ week: number; total: number }>> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/stats/commit_activity`,
      { headers: ghHeaders(token) }
    );
    // This endpoint can return 202 (computing) — treat as empty
    if (!res.ok || res.status === 202) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((week: any) => ({
      week: week.week as number,
      total: week.total as number,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch contributor count for a repository.
 * Uses per_page=1 and checks the Link header for the last page number.
 */
export async function fetchContributorCount(
  token: string,
  owner: string,
  repo: string
): Promise<number> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) return 0;
    const link = res.headers.get("Link");
    if (link) {
      const match = link.match(/page=(\d+)>;\s*rel="last"/);
      if (match) return parseInt(match[1], 10);
    }
    // No pagination = single page
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch release count for a repository.
 */
export async function fetchReleaseCount(
  token: string,
  owner: string,
  repo: string
): Promise<number> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/releases?per_page=1`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) return 0;
    const link = res.headers.get("Link");
    if (link) {
      const match = link.match(/page=(\d+)>;\s*rel="last"/);
      if (match) return parseInt(match[1], 10);
    }
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch repo metadata (for open_issues_count, forks_count, etc.)
 */
export async function fetchRepoMeta(
  token: string,
  owner: string,
  repo: string
): Promise<{
  open_issues: number;
  forks: number;
  updated_at: string;
  default_branch: string;
} | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}`,
      { headers: ghHeaders(token) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      open_issues: data.open_issues_count ?? 0,
      forks: data.forks_count ?? 0,
      updated_at: data.updated_at ?? "",
      default_branch: data.default_branch ?? "main",
    };
  } catch {
    return null;
  }
}
