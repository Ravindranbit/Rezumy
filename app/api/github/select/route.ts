import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// PUT /api/github/select — Toggle isSelected on a repo
export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, isSelected } = await request.json();

    if (!id || typeof isSelected !== "boolean") {
      return NextResponse.json(
        { error: "id and isSelected are required" },
        { status: 400 }
      );
    }

    // Verify repo belongs to user
    const repo = await prisma.gitHubRepo.findFirst({
      where: { id, userId },
    });

    if (!repo) {
      return NextResponse.json({ error: "Repo not found" }, { status: 404 });
    }

    const updated = await prisma.gitHubRepo.update({
      where: { id },
      data: { isSelected },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("GitHub select error:", error);
    return NextResponse.json(
      { error: "Failed to update selection" },
      { status: 500 }
    );
  }
}
