import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import {
  exchangeCodeForToken,
  fetchGitHubUser,
  encryptToken,
} from "@/lib/github";

// GET /api/github/callback — Handle GitHub OAuth callback
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Read CSRF state cookie directly from the request object
    const savedState = request.cookies.get("github_oauth_state")?.value;

    console.log("[GitHub Callback] code:", !!code, "state:", state, "savedState:", savedState);

    if (!code || !state || state !== savedState) {
      console.log("[GitHub Callback] State mismatch — code:", !!code, "stateMatch:", state === savedState);
      const response = NextResponse.redirect(
        new URL("/github?error=invalid_state", request.url)
      );
      response.cookies.delete("github_oauth_state");
      return response;
    }

    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code);
    console.log("[GitHub Callback] accessToken received:", !!accessToken);

    if (!accessToken) {
      const response = NextResponse.redirect(
        new URL("/github?error=token_exchange_failed", request.url)
      );
      response.cookies.delete("github_oauth_state");
      return response;
    }

    // Fetch GitHub user info
    const githubUser = await fetchGitHubUser(accessToken);
    console.log("[GitHub Callback] githubUser:", githubUser?.login);

    if (!githubUser) {
      const response = NextResponse.redirect(
        new URL("/github?error=user_fetch_failed", request.url)
      );
      response.cookies.delete("github_oauth_state");
      return response;
    }

    // Store encrypted token and GitHub info in the database
    // First, disconnect this GitHub account from any other user
    await prisma.user.updateMany({
      where: {
        githubId: String(githubUser.id),
        id: { not: userId },
      },
      data: {
        githubId: null,
        githubUsername: null,
        githubAccessToken: null,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        githubId: String(githubUser.id),
        githubUsername: githubUser.login,
        githubAccessToken: encryptToken(accessToken),
      },
    });
    console.log("[GitHub Callback] Success — connected as", githubUser.login);

    const response = NextResponse.redirect(
      new URL("/github?connected=true", request.url)
    );
    response.cookies.delete("github_oauth_state");
    return response;
  } catch (error) {
    console.error("[GitHub Callback] CAUGHT ERROR:", error);
    const response = NextResponse.redirect(
      new URL("/github?error=callback_failed", request.url)
    );
    response.cookies.delete("github_oauth_state");
    return response;
  }
}
