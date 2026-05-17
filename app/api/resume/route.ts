import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { resumeSchema } from "@/lib/validations";

// GET /api/resume — Fetch user's resume (most recent)
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: resume });
  } catch (error) {
    console.error("Resume GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/resume — Create new resume
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = resumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: parsed.data.title,
        summary: parsed.data.summary,
      },
    });

    return NextResponse.json({ success: true, data: resume });
  } catch (error) {
    console.error("Resume POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/resume — Update existing resume
export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, summary } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Resume ID is required" },
        { status: 400 }
      );
    }

    // Verify the resume belongs to the user
    const existing = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        summary: summary ?? existing.summary,
      },
    });

    return NextResponse.json({ success: true, data: resume });
  } catch (error) {
    console.error("Resume PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
