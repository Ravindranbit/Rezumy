import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import {
  decryptToken,
  fetchGitHubRepos,
  getAutoSelectRepoIds,
  TOPIC_SKILL_MAP,
} from "@/lib/github";

/**
 * Generate a professional, resume-ready description for a repository.
 * Uses only data available from the GitHub API — zero extra API calls.
 */
function generateResumeDescription(
  name: string,
  githubDescription: string | null,
  language: string | null,
  topics: string[]
): string {
  const lowerTopics = topics.map((t) => t.toLowerCase());
  const lowerDesc = (githubDescription || "").toLowerCase();
  const lowerName = name.toLowerCase();

  // ── Collect technologies ──
  const techs: string[] = [];
  if (language) techs.push(language);
  for (const topic of topics) {
    const mapped = TOPIC_SKILL_MAP[topic.toLowerCase()];
    if (mapped && !techs.includes(mapped)) techs.push(mapped);
  }

  // ── Classify project type ──
  type ProjectType = { label: string; verbs: string[]; features: string[] };
  const projectTypes: { keywords: string[]; type: ProjectType }[] = [
    {
      keywords: ["machine-learning", "deep-learning", "ai", "ml", "tensorflow", "pytorch", "model", "neural"],
      type: { label: "machine learning pipeline", verbs: ["Engineered", "Developed", "Built"], features: ["model training and evaluation", "data preprocessing and feature engineering", "automated prediction workflows"] },
    },
    {
      keywords: ["cli", "command-line", "terminal", "shell"],
      type: { label: "command-line tool", verbs: ["Built", "Developed", "Created"], features: ["argument parsing and validation", "interactive terminal interface", "automated task execution"] },
    },
    {
      keywords: ["api", "rest", "rest-api", "graphql", "backend", "server", "microservice"],
      type: { label: "RESTful API service", verbs: ["Designed", "Architected", "Developed"], features: ["endpoint routing and middleware", "data validation and error handling", "API documentation and versioning"] },
    },
    {
      keywords: ["react", "nextjs", "next-js", "vue", "angular", "svelte", "frontend", "web-app", "webapp", "dashboard"],
      type: { label: "web application", verbs: ["Developed", "Built", "Created"], features: ["responsive UI with modern component architecture", "client-side state management", "dynamic data rendering"] },
    },
    {
      keywords: ["mobile", "ios", "android", "flutter", "react-native"],
      type: { label: "mobile application", verbs: ["Developed", "Built", "Created"], features: ["cross-platform UI components", "native device integrations", "offline-first data synchronization"] },
    },
    {
      keywords: ["docker", "kubernetes", "devops", "infrastructure", "terraform", "ci-cd", "deploy"],
      type: { label: "infrastructure automation system", verbs: ["Architected", "Engineered", "Built"], features: ["containerized deployment pipeline", "automated CI/CD workflows", "infrastructure-as-code provisioning"] },
    },
    {
      keywords: ["library", "package", "sdk", "framework", "plugin"],
      type: { label: "reusable library", verbs: ["Developed", "Created", "Designed"], features: ["modular API design", "comprehensive documentation", "extensible plugin architecture"] },
    },
    {
      keywords: ["game", "unity", "godot", "gamedev"],
      type: { label: "interactive game", verbs: ["Developed", "Built", "Created"], features: ["game mechanics and physics", "asset management and rendering", "player interaction systems"] },
    },
  ];

  // Score each project type
  let bestType: ProjectType = {
    label: "software application",
    verbs: ["Developed", "Built", "Created"],
    features: ["modular architecture and clean code practices", "data processing and business logic", "user-facing functionality"],
  };
  let bestScore = 0;

  for (const pt of projectTypes) {
    let score = 0;
    for (const kw of pt.keywords) {
      if (lowerTopics.includes(kw)) score += 3;
      if (lowerDesc.includes(kw)) score += 2;
      if (lowerName.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestType = pt.type;
    }
  }

  // Check for full-stack signals
  const hasFrontend = lowerTopics.some((t) => ["react", "nextjs", "next-js", "vue", "angular", "svelte", "frontend"].includes(t));
  const hasBackend = lowerTopics.some((t) => ["api", "rest", "rest-api", "graphql", "backend", "express", "django", "flask", "fastapi", "spring-boot"].includes(t))
    || lowerDesc.includes("api") || lowerDesc.includes("backend") || lowerDesc.includes("server");
  const hasDb = lowerTopics.some((t) => ["mongodb", "postgresql", "mysql", "redis", "prisma", "supabase", "firebase"].includes(t))
    || lowerDesc.includes("database");

  if (hasFrontend && (hasBackend || hasDb)) {
    bestType = {
      label: "full-stack web application",
      verbs: ["Developed", "Architected", "Built"],
      features: ["end-to-end feature implementation", "database integration and data modeling", "secure user authentication and authorization"],
    };
  }

  // ── Pick action verb (deterministic from name hash) ──
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const verb = bestType.verbs[hash % bestType.verbs.length];

  // ── Build the description ──
  const techString = techs.length > 0
    ? ` using ${techs.slice(0, 4).join(", ")}`
    : "";

  // Pick a relevant feature to mention
  const featureHints: string[] = [];
  if (lowerTopics.includes("docker") || lowerDesc.includes("docker")) featureHints.push("containerized deployment");
  if (lowerTopics.some((t) => ["jwt", "auth", "oauth"].includes(t)) || lowerDesc.includes("auth")) featureHints.push("secure authentication");
  if (hasDb) featureHints.push("database integration");
  if (lowerTopics.some((t) => ["testing", "jest", "pytest", "cypress"].includes(t)) || lowerDesc.includes("test")) featureHints.push("automated testing");
  if (lowerTopics.some((t) => ["ci-cd", "github-actions"].includes(t)) || lowerDesc.includes("ci/cd")) featureHints.push("CI/CD pipeline");
  if (lowerDesc.includes("real-time") || lowerDesc.includes("realtime") || lowerDesc.includes("websocket")) featureHints.push("real-time data processing");

  // If no hints from topics, pick from project type defaults
  if (featureHints.length === 0) {
    featureHints.push(bestType.features[hash % bestType.features.length]);
  }

  // Use the GitHub description if it's good, otherwise generate from scratch
  if (githubDescription && githubDescription.length > 20) {
    // Enhance the GitHub description with tech context
    const cleaned = githubDescription.replace(/\n.*/s, "").trim();
    if (techs.length > 0) {
      return `${verb} ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1).replace(/\.$/, "")}${techString}, featuring ${featureHints[0]}`;
    }
    return `${verb} ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  // Generate from scratch
  const feature = featureHints.length > 0 ? ` with ${featureHints.slice(0, 2).join(" and ")}` : "";
  return `${verb} a ${bestType.label}${techString}${feature}`;
}

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
      githubRepos.map((repo) => {
        // Always generate a resume-ready description from GitHub metadata
        const description = generateResumeDescription(
          repo.name,
          repo.description,
          repo.language,
          repo.topics || []
        );

        return prisma.gitHubRepo.upsert({
          where: {
            userId_repoId: { userId, repoId: repo.id },
          },
          update: {
            name: repo.name,
            fullName: repo.full_name,
            description,
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
            description,
            language: repo.language || "",
            topics: repo.topics || [],
            url: repo.html_url,
            stars: repo.stargazers_count,
            repoUpdatedAt: repo.updated_at,
            isSelected: false, // Will be set by auto-select below
          },
        });
      })
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
