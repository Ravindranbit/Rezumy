"use client";

import { useState } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  Sparkles, 
  Loader2, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Building2,
  Clock,
  Globe
} from "lucide-react";
import { useJobs, useAuth } from "@/lib/hooks";
import StatusBanner from "@/components/ui/StatusBanner";

export default function JobsPage() {
  const { user } = useAuth();
  const { jobs, searching, error, searchJobs, clearError } = useJobs();
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setSearched(true);
    await searchJobs(role, location);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-ordr-accent font-bold text-[10px] uppercase tracking-[0.4em]">
            <Sparkles size={16} />
            AI Synthesis Node
          </div>
          <h1 className="text-6xl font-normal text-ordr-serif text-zinc-900 tracking-tight">
            Job <span className="italic text-ordr-accent">Finder.</span>
          </h1>
          <p className="text-zinc-400 max-w-xl font-medium leading-relaxed italic">
            "Scanning the global professional landscape to identify opportunities that align with your unique trajectory."
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] transition-all focus-within:shadow-[0_50px_120px_-30px_rgba(228,61,93,0.1)]">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Briefcase size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
            <input
              type="text"
              placeholder="Initialize role search..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-[#fcfaf7] border-none rounded-2xl text-[11px] font-bold tracking-widest uppercase text-zinc-900 placeholder-zinc-300 focus:ring-0 transition-all"
            />
          </div>
          <div className="w-px h-10 bg-zinc-100 hidden md:block" />
          <div className="relative flex-1 w-full">
            <MapPin size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
            <input
              type="text"
              placeholder="Define location node..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-[#fcfaf7] border-none rounded-2xl text-[11px] font-bold tracking-widest uppercase text-zinc-900 placeholder-zinc-300 focus:ring-0 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !role}
            className="w-full md:w-auto px-12 py-5 bg-ordr-accent text-white rounded-2xl text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group shadow-xl shadow-ordr-accent/20"
          >
            {searching ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} className="group-hover:scale-110 transition-transform" />
            )}
            {searching ? "Initializing..." : "Search"}
          </button>
        </form>
      </div>

      {/* Status Messages */}
      {error && (
        <StatusBanner type="error" text={error} onClose={clearError} />
      )}

      {/* Results Section */}
      {searching ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-10">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-ordr-accent/10 border-t-ordr-accent rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto text-ordr-accent animate-pulse" size={32} />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-normal text-ordr-serif">Scanning Protocols...</h3>
            <p className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase opacity-40">
              Aligning career nodes with global datasets
            </p>
          </div>
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-zinc-50 pb-8">
            <h2 className="text-3xl font-normal text-ordr-serif flex items-center gap-4">
              <TrendingUp size={24} className="text-ordr-accent" />
              Identified <span className="italic text-ordr-accent">Trajectories</span>
            </h2>
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.4em] bg-zinc-50 px-6 py-2 rounded-full">
              {jobs.length} Nodes Found
            </span>
          </div>

          <div className="grid gap-10">
            {jobs.map((job, idx) => (
              <div 
                key={idx}
                className="group bg-white rounded-[2rem] border border-zinc-50 p-10 hover:border-ordr-accent/20 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 flex flex-col md:flex-row gap-12 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-ordr-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex-1 space-y-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-normal text-ordr-serif text-zinc-900 group-hover:text-ordr-accent transition-colors leading-tight">
                          {job.title}
                        </h3>
                        {job.matchScore >= 90 && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-1 rounded-full font-bold uppercase tracking-[0.2em]">
                            Vanguard Match
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
                        <span className="flex items-center gap-3">
                          <Building2 size={16} className="text-ordr-accent/40" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-3">
                          <Globe size={16} className="text-ordr-accent/40" />
                          {job.source}
                        </span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 text-right space-y-1">
                      <div className="text-5xl font-normal text-ordr-serif text-zinc-900 flex items-baseline justify-end gap-1">
                        {job.matchScore}
                        <span className="text-xs font-bold text-zinc-300">%</span>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.4em]">Synthesis Score</span>
                    </div>
                  </div>

                  <p className="text-zinc-500 leading-relaxed line-clamp-2 font-medium italic opacity-80">
                    {job.snippet}
                  </p>

                  <div className="bg-ordr-paper/50 border border-ordr/5 rounded-2xl p-6 flex items-start gap-5">
                    <CheckCircle2 size={18} className="text-ordr-accent mt-1 shrink-0" />
                    <p className="text-sm text-zinc-700 font-medium italic leading-relaxed">
                      "{job.reason}"
                    </p>
                  </div>
                </div>

                <div className="md:w-px h-px md:h-auto bg-zinc-50" />

                <div className="shrink-0 flex flex-col justify-center">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-4 px-10 py-5 bg-[#1a1a1a] text-white rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-ordr-accent transition-all duration-500 group/link shadow-xl shadow-black/10"
                  >
                    Initialize Application
                    <ExternalLink size={16} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-40 bg-ordr-paper/30 rounded-[3rem] border border-dashed border-zinc-100 flex flex-col items-center justify-center text-center px-10">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl shadow-black/5 border border-zinc-50 flex items-center justify-center mb-10">
            <Search size={40} className="text-zinc-200" />
          </div>
          <h3 className="text-3xl font-normal text-ordr-serif text-zinc-900 mb-4">Awaiting Signal...</h3>
          <p className="text-zinc-400 font-medium italic max-w-sm">
            "Enter your desired professional node above to begin the global synthesis protocol."
          </p>
        </div>
      )}
    </div>
  );
}
