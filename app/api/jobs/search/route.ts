import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { findJobs } from "@/lib/job-finder";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobRole, location } = await request.json();
    if (!jobRole) {
      return NextResponse.json({ error: "Job role is required" }, { status: 400 });
    }

    // 1. Fetch candidate context from DB
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { skills: true },
    });

    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    if (!profile && !resume) {
      return NextResponse.json({ 
        error: "Profile or resume missing. Please complete your profile first." 
      }, { status: 400 });
    }

    const skills = profile?.skills.map(s => s.name) || [];
    const summary = resume?.summary || "";

    // 2. Get API keys from env
    const groqKey = process.env.GROQ_API_KEY;
    const serperKey = process.env.SERPER_API_KEY;

    if (!groqKey || !serperKey) {
      console.error("Missing AI API keys in environment");
      return NextResponse.json({ 
        error: "Job search service is currently unavailable. (Missing configuration)" 
      }, { status: 500 });
    }

    // 3. Find and Rank Jobs
    console.log(`Searching for "${jobRole}" in "${location || "Anywhere"}" for user ${userId}`);
    const jobs = await findJobs({
      resumeSummary: summary,
      skills,
      jobRole,
      location,
      groqKey,
      serperKey,
    });

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "We couldn't find any jobs matching your profile for this specific role/location. Try broadening your search terms."
      });
    }

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Job finder error:", error);
    return NextResponse.json(
      { error: "Failed to find jobs. Please try again later." },
      { status: 500 }
    );
  }
}
