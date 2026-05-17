"use client";

import { useAuth, useProfile } from "@/lib/hooks";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  Settings,
  Layout,
  FileText,
  User,
  Download,
  CheckCircle2,
  Clock,
  Zap,
  Briefcase,
  TrendingUp,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GitHubIcon from "@/components/ui/GitHubIcon";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (loading || profileLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 pt-4 pb-4 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-20">
          Dashboard / Overview
        </div>
        <h1 className="text-[52px] font-normal tracking-tight text-ordr-serif leading-[1.06]">
          Welcome back, <span className="italic text-ordr-accent">{user?.name?.split(" ")[0]}.</span>
        </h1>
        <p className="text-zinc-400 max-w-lg font-medium leading-relaxed">
          Your profile is 0% complete. Fill in the remaining sections to unlock the full builder experience.
        </p>
        <div className="flex gap-3 pt-1">
          <Link
            href="/resume"
            className="bg-ordr-accent text-white px-5 py-2.5 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all flex items-center gap-2"
          >
            Open Builder
            <ArrowUpRight size={14} />
          </Link>
          <button className="bg-white border border-zinc-200 text-ordr-text px-5 py-2.5 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-zinc-50 transition-all">
            Finish Profile
          </button>
        </div>
      </div>

      {/* Metric Grid - Unified white bar with thin dividers */}
      <div className="grid grid-cols-1 md:grid-cols-4 bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-sm">
        <MetricItem
          label="Profile Completion"
          value="0%"
          icon={<TrendingUp size={16} className="text-ordr-accent" />}
        />
        <MetricItem
          label="Sections Filled"
          value="0/5"
          icon={<FileText size={16} className="text-ordr-accent" />}
        />
        <MetricItem
          label="GitHub Sync"
          value="No"
          icon={<GitHubIcon size={16} className="text-ordr-accent" />}
        />
        <MetricItem
          label="Last Updated"
          value="Today"
          icon={<Clock size={16} className="text-ordr-accent" />}
        />
      </div>

      {/* Content Split */}
      <div className="grid lg:grid-cols-2 gap-10 items-stretch">
        {/* Left Column: Checklist */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-normal text-ordr-serif">Checklist</h2>
            <span className="text-[10px] font-bold text-zinc-200">0/5</span>
          </div>
          <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-sm flex-1">
            <ChecklistItem label="Contact Info" />
            <ChecklistItem label="Education" />
            <ChecklistItem label="Experience" />
            <ChecklistItem label="Skills" />
            <ChecklistItem label="Projects" />
          </div>
        </div>

        {/* Right Column: Actions & Insight */}
        <div className="space-y-4 flex flex-col h-full">
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-normal text-ordr-serif">Quick Actions</h2>
              <div className="w-4 h-4 border border-zinc-100 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-zinc-200 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ActionItem label="Edit Profile" desc="Manage your data." icon={<User size={18} />} />
              <ActionItem label="Draft Resume" desc="Refine your layout." icon={<FileText size={18} />} />
              <ActionItem label="Export PDF" desc="Generate final copy." icon={<Download size={18} />} />
              <ActionItem label="Sync GitHub" desc="Import latest repos." icon={<GitHubIcon size={18} />} />
            </div>
          </div>

          {/* Strategic Insight Box - White card with left red bar */}
          <div className="p-4 bg-white border border-zinc-100 rounded-xl relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-ordr-accent" />
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-ordr-accent" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-20">Strategic Insight</span>
              </div>
              <p className="text-ordr-serif text-[14px] leading-snug italic text-zinc-600">
                "The best way to predict the future is to create it. Start by documenting your wins in the profile section."
              </p>
              <div className="pt-2 border-t border-zinc-50">
                <span className="text-[9px] font-bold tracking-widest uppercase opacity-20">Editorial Desk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-7 border-r border-zinc-100 last:border-r-0 hover:bg-zinc-50/50 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">{label}</span>
      </div>
      <div className="text-[30px] font-normal text-ordr-serif">{value}</div>
    </div>
  );
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <div className="px-8 py-5 border-b border-zinc-50 last:border-b-0 flex items-center justify-between group hover:bg-zinc-50/50 transition-colors">
      <span className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 transition-opacity">{label}</span>
      <div className="w-4 h-4 border border-zinc-100 rounded-sm" />
    </div>
  );
}

function ActionItem({ label, desc, icon }: { label: string; desc: string; icon: React.ReactNode }) {
  return (
    <button className="p-4 bg-white border border-zinc-100 rounded-xl text-left hover:border-ordr-accent/30 transition-all duration-500 group shadow-sm">
      <div className="text-zinc-200 group-hover:text-ordr-accent transition-colors mb-3">{icon}</div>
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1">{label}</div>
      <div className="text-[10px] opacity-40 font-medium">{desc}</div>
    </button>
  );
}
