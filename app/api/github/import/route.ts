import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { transformRepoToProject } from "@/lib/github";

// POST /api/github/import — Convert selected repos into profile projects
export async function POST() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found. Create a profile first." },
        { status: 404 }
      );
    }

    // Get selected repos
    const selectedRepos = await prisma.gitHubRepo.findMany({
      where: { userId, isSelected: true },
    });

    if (selectedRepos.length === 0) {
      return NextResponse.json(
        { error: "No repositories selected" },
        { status: 400 }
      );
    }

    // Remove existing GitHub-sourced projects (replace with fresh import)
    await prisma.project.deleteMany({
      where: { profileId: profile.id, source: "github" },
    });

    // Transform selected repos into projects and create them
    const projectData = selectedRepos.map((repo) => {
      const transformed = transformRepoToProject({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics,
        url: repo.url,
        stars: repo.stars,
      });

      return {
        profileId: profile.id,
        title: transformed.title,
        description: transformed.description,
        techStack: transformed.techStack,
        source: "github",
      };
    });

    await prisma.project.createMany({ data: projectData });

    return NextResponse.json({
      success: true,
      data: { imported: projectData.length },
    });
  } catch (error) {
    console.error("GitHub import error:", error);
    return NextResponse.json(
      { error: "Failed to import projects" },
      { status: 500 }
    );
  }
}
