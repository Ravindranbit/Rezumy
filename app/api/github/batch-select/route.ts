import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

// PUT /api/github/batch-select — Select or deselect all repos for a user
export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isSelected } = await request.json();

    if (typeof isSelected !== "boolean") {
      return NextResponse.json(
        { error: "isSelected is required" },
        { status: 400 }
      );
    }

    await prisma.gitHubRepo.updateMany({
      where: { userId },
      data: { isSelected },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GitHub batch select error:", error);
    return NextResponse.json(
      { error: "Failed to update repositories" },
      { status: 500 }
    );
  }
}
