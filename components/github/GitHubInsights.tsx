"use client";

import { Code2, TrendingUp, Zap } from "lucide-react";
import type { GitHubRepoData } from "@/types";
import { TOPIC_SKILL_MAP, LANGUAGE_SKILL_MAP } from "@/lib/github-constants";

interface GitHubInsightsProps {
  repos: GitHubRepoData[];
}

export default function GitHubInsights({ repos }: GitHubInsightsProps) {
  if (repos.length === 0) return null;

  const totalRepos = repos.length;
  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);

  // Top languages
  const langCount: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  }
  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Skills detected (using centralized maps + keyword scanning)
  const skillCount: Record<string, number> = {};
  
  for (const repo of repos) {
    const currentRepoSkills = new Set<string>();

    // 1. Language → Skills
    if (repo.language && LANGUAGE_SKILL_MAP[repo.language]) {
      LANGUAGE_SKILL_MAP[repo.language].forEach(s => currentRepoSkills.add(s));
    } else if (repo.language) {
      currentRepoSkills.add(repo.language);
    }

    // 2. Topics → Skills
    const topics = Array.isArray(repo.topics) ? repo.topics : [];
    for (const topic of topics) {
      const skill = TOPIC_SKILL_MAP[topic.toLowerCase()];
      if (skill) currentRepoSkills.add(skill);
    }

    // 3. Description Keyword Scanning (Fallback for missing topics)
    const desc = (repo.description || "").toLowerCase();
    for (const [key, value] of Object.entries(TOPIC_SKILL_MAP)) {
      if (desc.includes(key.toLowerCase())) {
        currentRepoSkills.add(value);
      }
    }

    // Count frequencies
    currentRepoSkills.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  }
  
  const skillList = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill]) => skill);

  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-6">
      {/* Stats card */}
      <div className="bg-white rounded-xl border border-black/5 hover:border-[#e43d5d]/20 transition-all duration-300 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[#e43d5d]">
            <Code2 size={18} />
          </span>
          <span className="text-sm font-semibold text-ordr-text">
            Overview
          </span>
        </div>
        <div className="space-y-3.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-medium">Repositories</span>
            <span className="font-bold text-ordr-text tabular-nums">{totalRepos}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-medium">Total Stars</span>
            <span className="font-bold text-ordr-text tabular-nums">{totalStars}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-medium">Selected</span>
            <span className="font-bold text-[#e43d5d] tabular-nums">
              {repos.filter((r) => r.isSelected).length}
            </span>
          </div>
        </div>
      </div>

      {/* Top languages */}
      <div className="bg-white rounded-xl border border-black/5 hover:border-[#e43d5d]/20 transition-all duration-300 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[#e43d5d]">
            <TrendingUp size={18} />
          </span>
          <span className="text-sm font-semibold text-ordr-text">
            Top Languages
          </span>
        </div>
        <div className="space-y-3">
          {topLanguages.map(([lang, count]) => (
            <div key={lang} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                <span>{lang}</span>
                <span className="tabular-nums text-ordr-text">{count}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-50 rounded-full overflow-hidden border border-black/5">
                <div
                  className="h-full bg-[#e43d5d] rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, (count / totalRepos) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills detected */}
      <div className="bg-white rounded-xl border border-black/5 hover:border-[#e43d5d]/20 transition-all duration-300 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[#e43d5d]">
            <Zap size={18} />
          </span>
          <span className="text-sm font-semibold text-ordr-text">
            Skills Detected
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skillList.map((skill) => (
            <span
              key={skill}
              className="text-[10px] bg-zinc-50 text-[#e43d5d] border border-[#e43d5d]/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
            >
              {skill}
            </span>
          ))}
          {skillList.length === 0 && (
            <span className="text-sm text-zinc-400 font-light">
              No skills detected yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
