"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useGitHub } from "@/lib/hooks";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import RepoCard from "@/components/github/RepoCard";
import GitHubInsights from "@/components/github/GitHubInsights";
import {
  RefreshCw,
  Unlink,
  Shield,
  CheckCircle,
  AlertCircle,
  Search,
  X,
  Zap,
  Loader2,
} from "lucide-react";
import GitHubIcon from "@/components/ui/GitHubIcon";
import { apiFetch } from "@/utils/api";
import StatusBanner from "@/components/ui/StatusBanner";

function GitHubPageContent() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const {
    repos,
    loading,
    syncing,
    importing,
    error,
    fetchRepos,
    refreshRepos,
    toggleSelect,
    batchToggle,
    disconnect,
    unlinkRepo,
    clearError: clearGitHubError,
    analyzeRepo,
    analyzeAll,
  } = useGitHub();

  const [analyzingAll, setAnalyzingAll] = useState(false);

  const handleAnalyzeAll = async () => {
    setAnalyzingAll(true);
    const { data, error } = await analyzeAll();
    if (error) {
      // Show the actual server error for better debugging
      setStatusMessage({ type: "error", text: error });
    } else {
      const analyzed = (data as { analyzed?: number })?.analyzed ?? 0;
      const errCount = ((data as { errors?: string[] })?.errors ?? []).length;
      if (analyzed === 0 && errCount === 0) {
        setStatusMessage({ type: "success", text: "All repositories already analyzed!" });
      } else if (errCount > 0) {
        setStatusMessage({
          type: "success",
          text: `Analyzed ${analyzed} repositories. ${errCount} could not be reached (private or empty repos).`,
        });
      } else {
        setStatusMessage({
          type: "success",
          text: `✓ Deep-analyzed ${analyzed} repositories. Skills & tech stack updated!`,
        });
      }
    }
    setAnalyzingAll(false);
  };

  const searchParams = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isConnected = !!user?.githubId;

  // Handle OAuth callback status
  useEffect(() => {
    const connected = searchParams.get("connected");
    const errorParam = searchParams.get("error");

    if (connected === "true") {
      setStatusMessage({
        type: "success",
        text: "GitHub connected successfully! Fetching your repositories...",
      });
      refreshUser();
      window.history.replaceState({}, "", "/github");
    }

    if (errorParam) {
      const messages: Record<string, string> = {
        invalid_state: "Security verification failed. Please try again.",
        token_exchange_failed: "Failed to connect with GitHub. Please try again.",
        user_fetch_failed: "Could not fetch your GitHub profile.",
        callback_failed: "Connection failed. Please try again.",
      };
      setStatusMessage({
        type: "error",
        text: messages[errorParam] || "An error occurred. Please try again.",
      });
      window.history.replaceState({}, "", "/github");
    }
  }, [searchParams, refreshUser]);

  // Fetch repos when connected
  useEffect(() => {
    if (isConnected) {
      fetchRepos();
    }
  }, [isConnected, fetchRepos]);

  const handleConnect = async () => {
    setConnecting(true);
    const { data, error } = await apiFetch<{ url: string }>(
      "/api/github/connect"
    );
    if (error) {
      setStatusMessage({ type: "error", text: error });
      setConnecting(false);
    } else if (data?.url) {
      window.location.href = data.url;
    }
  };


  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    const { error } = await disconnect();
    
    if (error) {
      setStatusMessage({
        type: "error",
        text: `Failed to disconnect: ${error}`,
      });
      setDisconnecting(false);
      setShowDisconnectConfirm(false);
    } else {
      // Success - full reload to ensure all states are cleared
      window.location.reload();
    }
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = repos.filter((r) => r.isSelected).length;

  if (authLoading) return <LoadingSpinner />;

  // ─── Disconnected State ─────────────────────────────────

  if (!isConnected) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-ordr-text tracking-tight">
          GitHub Integration
        </h1>
        <p className="text-sm text-zinc-500 mt-1 mb-8">
          Import your repositories as resume-ready projects
        </p>

        {statusMessage && (
          <StatusBanner
            type={statusMessage.type}
            text={statusMessage.text}
            onClose={() => setStatusMessage(null)}
          />
        )}

        <div className="max-w-lg mx-auto mt-12">
          <div className="bg-white rounded-3xl border border-black/5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] p-10 text-center">
            <div className="w-16 h-16 bg-[#e43d5d]/5 border border-[#e43d5d]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GitHubIcon size={32} className="text-[#e43d5d]" />
            </div>
            <h2 className="text-xl font-bold text-ordr-text mb-2.5 tracking-tight">
              Connect Your GitHub
            </h2>
            <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
              Link your GitHub account to automatically import your repositories
              as resume-ready projects. We analyze your code to generate
              professional descriptions and detect your tech skills.
            </p>

            <div className="bg-zinc-50 border border-black/[0.03] rounded-2xl p-5 mb-8 flex items-start gap-3">
              <Shield size={18} className="text-[#e43d5d] mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-500 text-left leading-relaxed font-medium">
                We only read your public repositories to generate resume
                projects. We never modify your code, create repositories, or
                access private data without explicit permission.
              </p>
            </div>

            <Button
              onClick={handleConnect}
              loading={connecting}
              size="lg"
              className="w-full gap-2.5 py-6 rounded-xl bg-[#e43d5d] hover:bg-[#c93552] text-white transition-all shadow-md hover:shadow-lg"
            >
              <GitHubIcon size={20} />
              Connect GitHub Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Connected State ────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-ordr-text tracking-tight">
              GitHub Repositories
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Connected as{" "}
              <span className="font-bold text-[#e43d5d]">
                @{user?.githubUsername}
              </span>{" "}
              · Selection is automatically saved
            </p>
          </div>
          <button
            onClick={refreshRepos}
            disabled={syncing}
            className={`p-2 rounded-lg border border-black/5 hover:bg-zinc-50 transition-all ${syncing ? 'animate-spin opacity-50' : 'opacity-40 hover:opacity-100'}`}
            title="Refresh repositories"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Status messages */}
      {statusMessage && (
        <StatusBanner
          type={statusMessage.type}
          text={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {error && !statusMessage && (
        <StatusBanner
          type="error"
          text={error}
          onClose={clearGitHubError}
        />
      )}

      {/* Insights */}
      <GitHubInsights repos={repos} />

      {/* Search & Actions */}
      {repos.length > 0 && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl text-sm text-ordr-text placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-[#e43d5d]/5 focus:border-[#e43d5d]/30 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-[#e43d5d] transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyzeAll}
              disabled={analyzingAll}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#e43d5d] bg-[#e43d5d]/5 hover:bg-[#e43d5d]/10 border border-[#e43d5d]/10 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              title="Deep-analyze all repos: scans package.json, README, and config files"
            >
              {analyzingAll ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Zap size={11} />
              )}
              {analyzingAll ? "Analyzing..." : "Analyze All"}
            </button>
            <div className="w-px h-4 bg-black/5" />
            <button
              onClick={() => batchToggle(true)}
              disabled={importing}
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#e43d5d] hover:bg-[#e43d5d]/5 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              Link All
            </button>
            <div className="w-px h-4 bg-black/5" />
            <button
              onClick={() => batchToggle(false)}
              disabled={importing}
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 hover:text-zinc-600 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
            >
              Unlink All
            </button>
          </div>
        </div>
      )}

      {/* Repo Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredRepos.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onToggle={toggleSelect}
              onUnlink={unlinkRepo}
              onAnalyze={analyzeRepo}
            />
          ))}
        </div>
      ) : repos.length > 0 && searchQuery ? (
        <EmptyState
          icon={<Search size={24} />}
          title="No matching repos"
          description={`No repositories match "${searchQuery}"`}
        />
      ) : (
        <EmptyState
          icon={<GitHubIcon size={24} />}
          title="No repositories found"
          description="Try adding public repositories on GitHub, or check your connection permissions."
        />
      )}

      <div className="mt-12 pt-8 border-t border-black/[0.03]">
        <div className="bg-white rounded-xl border border-red-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-ordr-text tracking-tight">Disconnect GitHub</h3>
            <p className="text-[11px] text-zinc-400 mt-1 font-medium max-w-sm">
              Remove all imported repositories and GitHub projects from your profile. This action cannot be undone.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {showDisconnectConfirm ? (
              <>
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-600 px-4 py-2.5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-red-600 text-white rounded-lg px-6 py-2.5 hover:bg-red-700 transition-all duration-300 shadow-md disabled:opacity-50"
                >
                  {disconnecting ? "Processing..." : "Confirm Disconnect"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 border border-red-200 rounded-lg px-6 py-2.5 hover:bg-red-50 transition-all duration-300"
              >
                <Unlink size={13} />
                Disconnect Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapping with Suspense for useSearchParams
export default function GitHubPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GitHubPageContent />
    </Suspense>
  );
}

// ─── Shared Components ──────────────────────────────────

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-black/[0.03] shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
      <div className="w-16 h-16 bg-zinc-50 border border-black/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-300">
        {icon}
      </div>
      <h3 className="font-bold text-ordr-text text-lg mb-1.5 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">{description}</p>
    </div>
  );
}
