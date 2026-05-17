import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// DELETE /api/github/unlink — Remove a specific GitHub-imported project by repo name
export async function DELETE(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoName } = await request.json();
    if (!repoName) {
      return NextResponse.json(
        { error: "Repository name is required" },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Delete the GitHub-sourced project matching this repo name
    const deleted = await prisma.project.deleteMany({
      where: {
        profileId: profile.id,
        source: "github",
        title: repoName,
      },
    });

    // Also deselect the repo in the cached list
    await prisma.gitHubRepo.updateMany({
      where: { userId, name: repoName },
      data: { isSelected: false },
    });

    return NextResponse.json({
      success: true,
      data: { removed: deleted.count },
    });
  } catch (error) {
    console.error("GitHub unlink error:", error);
    return NextResponse.json(
      { error: "Failed to remove project" },
      { status: 500 }
    );
  }
}
