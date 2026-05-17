import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// POST /api/github/disconnect — Remove GitHub connection and cleanup data
export async function POST() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all cached GitHub repos
    await prisma.gitHubRepo.deleteMany({ where: { userId } });

    // Optionally delete GitHub-imported projects from profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (profile) {
      await prisma.project.deleteMany({
        where: { profileId: profile.id, source: "github" },
      });
    }

    // Clear GitHub fields from user
    await prisma.user.update({
      where: { id: userId },
      data: {
        githubId: null,
        githubUsername: null,
        githubAccessToken: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GitHub disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect GitHub" },
      { status: 500 }
    );
  }
}
