import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { decryptToken } from "@/lib/github";
import { analyzeRepository } from "@/lib/github-analyzer";

// Force Node.js runtime — required for Buffer (base64 decoding) in github-analyzer
export const runtime = "nodejs";

// POST /api/github/analyze — Deep-analyze a single repo
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repoId } = body;

    if (!repoId) {
      return NextResponse.json({ error: "repoId is required" }, { status: 400 });
    }

    // Get the repo from DB
    const repo = await prisma.gitHubRepo.findFirst({
      where: { id: repoId, userId },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 });
    }

    // Validate fullName
    if (!repo.fullName || !repo.fullName.includes("/")) {
      return NextResponse.json(
        { error: `Invalid repo fullName: "${repo.fullName}"` },
        { status: 400 }
      );
    }

    // Get user's GitHub token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user?.githubAccessToken) {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
    }

    const token = decryptToken(user.githubAccessToken);

    // Run deep analysis
    const analysis = await analyzeRepository(token, repo.fullName, {
      language: repo.language,
      topics: Array.isArray(repo.topics) ? (repo.topics as string[]) : [],
      description: repo.description,
      name: repo.name,
    });

    // Persist analysis results
    const updated = await prisma.gitHubRepo.update({
      where: { id: repoId },
      data: {
        analyzedSkills: analysis.skills,
        projectType: analysis.projectType,
        techStack: analysis.techStack,
        // Only override description if the analysis generated a better one
        ...(analysis.enhancedDescription && !repo.description
          ? { description: analysis.enhancedDescription }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        skills: analysis.skills,
        projectType: analysis.projectType,
        techStack: analysis.techStack,
        description: updated.description,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("GitHub analyze error:", msg);
    return NextResponse.json(
      { error: `Analysis failed: ${msg}` },
      { status: 500 }
    );
  }
}

// GET /api/github/analyze — Bulk-analyze repos that haven't been analyzed yet
// ?all=true to re-analyze all, ?all=false (default) for only un-analyzed
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user?.githubAccessToken) {
      return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
    }

    const token = decryptToken(user.githubAccessToken);

    // Fetch repos — skip ones already analyzed unless all=true
    const repos = await prisma.gitHubRepo.findMany({
      where: {
        userId,
        // Filter by valid fullName to avoid crashes
        fullName: { contains: "/" },
        ...(all ? {} : { projectType: "" }),
      },
      orderBy: { stars: "desc" },
      take: 30,
    });

    if (repos.length === 0) {
      return NextResponse.json({
        success: true,
        analyzed: 0,
        errors: [],
        total: 0,
        message: "All repositories already analyzed",
      });
    }

    let analyzed = 0;
    const errors: string[] = [];

    // Process in batches of 3 to respect GitHub rate limits
    for (let i = 0; i < repos.length; i += 3) {
      const batch = repos.slice(i, i + 3);

      await Promise.all(
        batch.map(async (repo) => {
          try {
            const analysis = await analyzeRepository(token, repo.fullName, {
              language: repo.language,
              topics: Array.isArray(repo.topics) ? (repo.topics as string[]) : [],
              description: repo.description,
              name: repo.name,
            });

            await prisma.gitHubRepo.update({
              where: { id: repo.id },
              data: {
                analyzedSkills: analysis.skills,
                projectType: analysis.projectType,
                techStack: analysis.techStack,
              },
            });
            analyzed++;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Failed to analyze ${repo.name}:`, msg);
            errors.push(repo.name);
          }
        })
      );

      // Rate-limit delay between batches
      if (i + 3 < repos.length) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    return NextResponse.json({
      success: true,
      analyzed,
      errors,
      total: repos.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("GitHub bulk analyze error:", msg);
    return NextResponse.json(
      { error: `Bulk analysis failed: ${msg}` },
      { status: 500 }
    );
  }
}
