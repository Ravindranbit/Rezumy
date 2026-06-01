import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/github/analyze/quality — Quality leaderboard for all analyzed repos
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repos = await prisma.gitHubRepo.findMany({
      where: {
        userId,
        qualityScore: { gt: 0 }, // Only repos with v2 analysis
      },
      orderBy: { qualityScore: "desc" },
      select: {
        id: true,
        name: true,
        fullName: true,
        description: true,
        language: true,
        url: true,
        stars: true,
        isSelected: true,
        projectType: true,
        qualityScore: true,
        qualityGrade: true,
        projectProfile: true,
        verifiedTechs: true,
        activityMetrics: true,
      },
    });

    const leaderboard = repos.map((repo, index) => {
      const profile = repo.projectProfile as Record<string, unknown> | null;
      const verifiedTechs = Array.isArray(repo.verifiedTechs)
        ? (repo.verifiedTechs as Array<{ technology: string; confidence: string }>)
        : [];
      const activity = repo.activityMetrics as Record<string, unknown> | null;

      return {
        rank: index + 1,
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        language: repo.language,
        url: repo.url,
        stars: repo.stars,
        isSelected: repo.isSelected,
        projectType: repo.projectType,
        qualityScore: repo.qualityScore,
        qualityGrade: repo.qualityGrade,
        architecture: profile?.architecture || "Unknown",
        category: profile?.category || "Software Project",
        complexity: profile?.complexity_score || 0,
        verifiedTechCount: verifiedTechs.length,
        topTechs: verifiedTechs.slice(0, 5).map((t) => t.technology),
        isActive: activity?.active || false,
      };
    });

    return NextResponse.json({
      success: true,
      total: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Quality leaderboard error:", msg);
    return NextResponse.json(
      { error: `Failed to fetch quality leaderboard: ${msg}` },
      { status: 500 }
    );
  }
}
