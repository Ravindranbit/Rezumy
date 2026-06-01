// ============================================================
// Activity Fetcher
//
// Gathers repository activity metrics from the GitHub API:
// commit frequency, contributors, releases, issues, forks.
// ============================================================

import {
  fetchCommitActivity,
  fetchContributorCount,
  fetchReleaseCount,
  fetchRepoMeta,
} from "./github-fetcher";
import type { ActivityMetrics } from "@/lib/types/repository-profile";

/**
 * Fetch all activity metrics for a repository.
 * Calls multiple GitHub API endpoints in parallel.
 */
export async function fetchActivityMetrics(
  token: string,
  owner: string,
  repo: string
): Promise<ActivityMetrics> {
  const [commitActivity, contributors, releases, meta] = await Promise.all([
    fetchCommitActivity(token, owner, repo),
    fetchContributorCount(token, owner, repo),
    fetchReleaseCount(token, owner, repo),
    fetchRepoMeta(token, owner, repo),
  ]);

  // Calculate commits in last 90 days (~13 weeks)
  const recentWeeks = commitActivity.slice(-13);
  const commitsLast90Days = recentWeeks.reduce((sum, w) => sum + w.total, 0);
  const totalCommits = commitActivity.reduce((sum, w) => sum + w.total, 0);

  // Determine if repo is "active" (updated in last 6 months)
  const lastUpdate = meta?.updated_at || "";
  let active = false;
  if (lastUpdate) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    active = new Date(lastUpdate) > sixMonthsAgo;
  }

  return {
    commits_last_90_days: commitsLast90Days,
    total_commits: totalCommits,
    contributors,
    last_update: lastUpdate,
    releases,
    active,
    open_issues: meta?.open_issues ?? 0,
    forks: meta?.forks ?? 0,
  };
}
