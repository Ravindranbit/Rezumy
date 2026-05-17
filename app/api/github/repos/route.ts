import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import {
  decryptToken,
  fetchGitHubRepos,
  getAutoSelectRepoIds,
} from "@/lib/github";

// GET /api/github/repos — Fetch repos from GitHub (or cache) and sync to DB
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";

    // Check if user has GitHub connected
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user?.githubAccessToken) {
      return NextResponse.json(
        { error: "GitHub not connected" },
        { status: 400 }
      );
    }

    // If not refreshing, return cached repos from DB
    if (!refresh) {
      const cachedRepos = await prisma.gitHubRepo.findMany({
        where: { userId },
        orderBy: { stars: "desc" },
      });

      if (cachedRepos.length > 0) {
        return NextResponse.json({ success: true, data: cachedRepos });
      }
    }

    // Fetch fresh repos from GitHub API
    const token = decryptToken(user.githubAccessToken);
    const githubRepos = await fetchGitHubRepos(token);

    if (githubRepos.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Sync repos to DB using upsert (preserves isSelected state on refresh)
    const syncedRepos = await prisma.$transaction(
      githubRepos.map((repo) =>
        prisma.gitHubRepo.upsert({
          where: {
            userId_repoId: { userId, repoId: repo.id },
          },
          update: {
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || "",
            language: repo.language || "",
            topics: repo.topics || [],
            url: repo.html_url,
            stars: repo.stargazers_count,
            repoUpdatedAt: repo.updated_at,
          },
          create: {
            userId,
            repoId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || "",
            language: repo.language || "",
            topics: repo.topics || [],
            url: repo.html_url,
            stars: repo.stargazers_count,
            repoUpdatedAt: repo.updated_at,
            isSelected: false, // Will be set by auto-select below
          },
        })
      )
    );

    // Auto-select top repos if this is the first fetch (no repos were cached before)
    if (!refresh || syncedRepos.every((r) => !r.isSelected)) {
      const autoSelectIds = getAutoSelectRepoIds(
        syncedRepos.map((r) => ({
          repoId: r.repoId,
          stars: r.stars,
          description: r.description,
          repoUpdatedAt: r.repoUpdatedAt,
        }))
      );

      if (autoSelectIds.length > 0) {
        await prisma.gitHubRepo.updateMany({
          where: {
            userId,
            repoId: { in: autoSelectIds },
          },
          data: { isSelected: true },
        });
      }
    }

    // Return the final repo list
    const finalRepos = await prisma.gitHubRepo.findMany({
      where: { userId },
      orderBy: { stars: "desc" },
    });

    return NextResponse.json({ success: true, data: finalRepos });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
