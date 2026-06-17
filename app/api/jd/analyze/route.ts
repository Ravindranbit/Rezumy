// ============================================================
// POST /api/jd/analyze — Parse a Job Description
//
// Accepts raw JD text, parses it via the JD parser engine,
// stores the result in the database, and returns the structured output.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { parseJobDescription } from "@/lib/engine/jd-parser";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── Parse request body ────────────────────────────────
    const body = await request.json();
    const { rawText } = body as { rawText?: string };

    if (!rawText || typeof rawText !== "string" || rawText.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide a job description with at least 20 characters.",
        },
        { status: 400 }
      );
    }

    // ── Groq API key ─────────────────────────────────────
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      console.error("GROQ_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "AI service is not configured." },
        { status: 500 }
      );
    }

    // ── Parse the JD ─────────────────────────────────────
    const parsed = await parseJobDescription(rawText.trim(), { groqKey });

    // ── Persist to database ──────────────────────────────
    const jd = await prisma.jobDescription.create({
      data: {
        userId,
        rawText: rawText.trim(),
        // Prisma's Json type requires InputJsonValue — serialize round-trip
        parsed: JSON.parse(JSON.stringify(parsed)),
      },
    });

    // ── Return structured result ─────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        id: jd.id,
        rawText: jd.rawText,
        parsed,
        createdAt: jd.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("JD analyze error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to analyze job description";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/jd/analyze — List user's parsed JDs
//
// Returns all parsed job descriptions for the current user,
// ordered by most recent first.
// ============================================================

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobDescriptions = await prisma.jobDescription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rawText: true,
        parsed: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: jobDescriptions.map((jd) => ({
        id: jd.id,
        rawText: jd.rawText,
        parsed: jd.parsed,
        createdAt: jd.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("JD list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job descriptions" },
      { status: 500 }
    );
  }
}
