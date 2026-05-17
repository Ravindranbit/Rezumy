"use client";

import { useState } from "react";
import { Star, Clock, ExternalLink, Zap, Loader2 } from "lucide-react";
import GitHubIcon from "@/components/ui/GitHubIcon";
import type { GitHubRepoData } from "@/types";

interface RepoCardProps {
  repo: GitHubRepoData;
  onToggle: (id: string, isSelected: boolean) => void;
  onUnlink?: (repoName: string) => Promise<{ error?: string }>;
  onAnalyze?: (id: string) => Promise<{ data?: unknown; error?: string | null }>;
}

export default function RepoCard({ repo, onToggle, onUnlink, onAnalyze }: RepoCardProps) {
  const [unlinking, setUnlinking] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const analyzedSkills = Array.isArray(repo.analyzedSkills) ? repo.analyzedSkills : [];
  const updatedDate = repo.repoUpdatedAt
    ? new Date(repo.repoUpdatedAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  const languageColors: Record<string, string> = {
    JavaScript: "bg-[#f7df1e]",
    TypeScript: "bg-[#3178c6]",
    Python: "bg-[#3776ab]",
    Java: "bg-[#007396]",
    Go: "bg-[#00add8]",
    Rust: "bg-[#dea584]",
    "C++": "bg-[#f34b7d]",
    C: "bg-[#a8b9cc]",
    "C#": "bg-[#178600]",
    Ruby: "bg-[#701516]",
    PHP: "bg-[#4f5d95]",
    Swift: "bg-[#f05138]",
    Kotlin: "bg-[#a97bff]",
    Dart: "bg-[#00b4ab]",
    HTML: "bg-[#e34c26]",
    CSS: "bg-[#563d7c]",
    Shell: "bg-[#89e051]",
    "Jupyter Notebook": "bg-[#da5b0b]",
  };

  const handleToggle = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (repo.isSelected && onUnlink) {
      setUnlinking(true);
      await onUnlink(repo.name);
      setUnlinking(false);
    } else {
      onToggle(repo.id, true);
    }
  };

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAnalyze || analyzing) return;
    setAnalyzing(true);
    await onAnalyze(repo.id);
    setAnalyzing(false);
  };

  const isAnalyzed = analyzedSkills.length > 0 || !!repo.projectType;

  return (
    <div
      onClick={() => handleToggle()}
      className={`group relative rounded-xl border transition-all duration-300 p-5 cursor-pointer ${
        repo.isSelected
          ? "bg-[#e43d5d]/[0.02] border-[#e43d5d] shadow-[0_15px_40px_-10px_rgba(228,61,93,0.15)]"
          : "bg-white border-black/[0.06] hover:border-[#e43d5d]/20 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5"
      }`}
    >
      {/* Top badges row */}
      <div className="flex items-center gap-2 mb-3 min-h-[18px]">
        {repo.projectType && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border border-black/[0.05] px-2 py-0.5 rounded-full">
            {repo.projectType}
          </span>
        )}
        {repo.isSelected && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#e43d5d] bg-[#e43d5d]/10 px-2 py-0.5 rounded-full ml-auto">
            Imported
          </span>
        )}
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <GitHubIcon
            size={16}
            className={`shrink-0 transition-colors ${
              repo.isSelected
                ? "text-[#e43d5d]"
                : "text-zinc-400 group-hover:text-zinc-600"
            }`}
          />
          <h3 className="font-semibold text-ordr-text truncate text-sm tracking-tight">
            {repo.name}
          </h3>
        </div>

        {/* Toggle */}
        <button
          onClick={(e) => handleToggle(e)}
          disabled={unlinking}
          className={`shrink-0 relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${
            repo.isSelected ? "bg-[#e43d5d]" : "bg-zinc-200"
          }`}
          role="switch"
          aria-checked={repo.isSelected}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
              repo.isSelected ? "translate-x-[22px]" : "translate-x-[4px]"
            }`}
          />
        </button>
      </div>

      {/* Description */}
      {repo.description ? (
        <p className="text-[13px] text-zinc-500 line-clamp-2 mb-3 leading-relaxed font-normal">
          {repo.description.split("\n")[0]}
        </p>
      ) : (
        <p className="text-[13px] italic text-zinc-400 mb-3 font-light">
          No description provided
        </p>
      )}

      {/* Analyzed Skills */}
      {analyzedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {analyzedSkills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="text-[9px] bg-[#e43d5d]/5 text-[#e43d5d] border border-[#e43d5d]/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            >
              {skill}
            </span>
          ))}
          {analyzedSkills.length > 6 && (
            <span className="text-[9px] text-zinc-400 px-1 py-0.5 font-medium">
              +{analyzedSkills.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-400">
        {repo.language && (
          <span className="flex items-center gap-1.5 text-zinc-500">
            <span
              className={`w-2 h-2 rounded-full ${
                languageColors[repo.language] || "bg-zinc-400"
              }`}
            />
            {repo.language}
          </span>
        )}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1 hover:text-amber-500 transition-colors">
            <Star size={11} className="fill-current" />
            {repo.stars}
          </span>
        )}
        {updatedDate && (
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {updatedDate}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {/* Analyze button */}
          {onAnalyze && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              title={isAnalyzed ? "Re-analyze repository" : "Analyze tech stack"}
              className={`p-1 rounded transition-all duration-200 ${
                isAnalyzed
                  ? "text-zinc-200 hover:text-[#e43d5d]"
                  : "text-[#e43d5d] hover:bg-[#e43d5d]/10 animate-pulse"
              }`}
            >
              {analyzing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Zap size={13} />
              )}
            </button>
          )}

          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-300 hover:text-[#e43d5d] transition-colors p-1 -m-1"
            aria-label="Open on GitHub"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Topics (only when no analyzed skills yet) */}
      {topics.length > 0 && analyzedSkills.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-black/[0.03]">
          {topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="text-[10px] bg-zinc-50 text-zinc-500 border border-black/[0.05] px-2 py-0.5 rounded-full font-medium"
            >
              {topic}
            </span>
          ))}
          {topics.length > 3 && (
            <span className="text-[10px] text-zinc-400 px-1 py-0.5">
              +{topics.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
