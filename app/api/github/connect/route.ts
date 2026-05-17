import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getGitHubAuthUrl } from "@/lib/github";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

// GET /api/github/connect — Redirect user to GitHub OAuth
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate CSRF state token
    const state = randomBytes(16).toString("hex");

    const authUrl = getGitHubAuthUrl(state);

    const response = NextResponse.json({ success: true, data: { url: authUrl } });
    
    // Store state in a short-lived cookie for verification on callback
    response.cookies.set("github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("GitHub connect error:", error);
    return NextResponse.json(
      { error: "Failed to initiate GitHub connection" },
      { status: 500 }
    );
  }
}
