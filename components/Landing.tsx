"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Zap, FileText, Globe, Shield, Star, PlayCircle } from "lucide-react";

export default function EditorialLanding() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#1a1a1a] font-sans selection:bg-ordr-accent selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-24 items-center justify-between px-10 md:px-20 bg-[#f8f8f8]/80 backdrop-blur-md">
        <Link href="/" className="text-3xl font-normal text-ordr-accent text-ordr-serif tracking-tight">
          Rezumy
        </Link>
        <div className="flex items-center gap-12">
          <Link href="/login" className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity hidden md:block">
            Journal Entry
          </Link>
          <Link
            href="/signup"
            className="bg-ordr-accent text-white px-8 py-3 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#1a1a1a] transition-all duration-500 shadow-xl shadow-ordr-accent/20"
          >
            Start Building
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-52 pb-32 px-10 md:px-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-ordr-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-30">Current Edition: 2024.01</span>
            </div>
            <h1 className="text-7xl md:text-8xl font-normal text-ordr-serif leading-[0.9] tracking-tighter">
              The <span className="italic text-ordr-accent">Art</span> of the Resume.
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 max-w-xl leading-relaxed font-medium">
              Precision-engineered for the modern professional. We transform your career history into a high-fidelity editorial document that commands attention.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Link
                href="/signup"
                className="bg-ordr-accent text-white px-12 py-5 rounded-md text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-[#1a1a1a] transition-all duration-700 shadow-2xl shadow-ordr-accent/20 flex items-center justify-center gap-4 group"
              >
                Create Your Account
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <button className="px-12 py-5 border border-zinc-200 rounded-md text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-white hover:shadow-xl transition-all duration-500 flex items-center justify-center gap-4">
                <PlayCircle size={18} className="text-ordr-accent" />
                View Showcase
              </button>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="absolute -inset-10 bg-ordr-accent/5 blur-[120px] rounded-full" />
            <div className="relative bg-white border border-zinc-100 p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] rounded-2xl transform hover:scale-[1.02] transition-transform duration-700">
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-zinc-50 pb-8">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-zinc-100 rounded-full" />
                    <div className="h-3 w-20 bg-zinc-50 rounded-full" />
                  </div>
                  <div className="w-12 h-12 bg-ordr-accent/10 rounded-xl" />
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-full bg-zinc-50 rounded-full" />
                  <div className="h-3 w-[90%] bg-zinc-50 rounded-full" />
                  <div className="h-3 w-[95%] bg-zinc-50 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="h-20 bg-ordr-paper border border-zinc-50 rounded-xl" />
                  <div className="h-20 bg-ordr-paper border border-zinc-50 rounded-xl" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-6 shadow-2xl rounded-2xl border border-zinc-50 max-w-[240px] animate-bounce-slow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-40">Match Score</span>
                </div>
                <div className="text-3xl font-normal text-ordr-serif">98.4%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-10 md:px-20 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-5xl font-normal text-ordr-serif tracking-tight">The Core <span className="italic text-ordr-accent">Protocols.</span></h2>
            <p className="text-zinc-400 font-medium tracking-wide">Four essential nodes in your professional evolution.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-zinc-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <FeatureCard
              icon={<Zap size={24} />}
              title="AI SYNTHESIS"
              desc="Our engine distills your achievements into high-impact professional metrics."
            />
            <FeatureCard
              icon={<FileText size={24} />}
              title="EDITORIAL LAYOUT"
              desc="Typography-first designs that honor the weight of your professional journey."
            />
            <FeatureCard
              icon={<Globe size={24} />}
              title="GLOBAL ACCESS"
              desc="Host your professional manifest anywhere with optimized digital delivery."
            />
            <FeatureCard
              icon={<Shield size={24} />}
              title="ATS SECURE"
              desc="Engineered to pass every digital gatekeeper while maintaining visual excellence."
            />
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-40 px-10 md:px-20 bg-[#1a1a1a] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ordr-accent/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          <div className="space-y-8 max-w-4xl">
            <h2 className="text-7xl md:text-8xl font-normal text-ordr-serif leading-tight">Ready to join the <span className="italic text-ordr-accent underline decoration-ordr-accent/30 underline-offset-8">vanguard?</span></h2>
            <p className="text-2xl text-zinc-500 font-medium max-w-2xl">
              The next edition of your career starts here. Secure your professional legacy today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8">
            <Link
              href="/signup"
              className="bg-white text-[#1a1a1a] px-16 py-6 rounded-md text-[12px] font-bold tracking-[0.4em] uppercase hover:bg-ordr-accent hover:text-white transition-all duration-700 text-center"
            >
              Initialize Profile
            </Link>
            <div className="flex items-center gap-6 px-4">
              <div className="flex -space-x-4">
                {[1, 2, 3].map(i => <div key={i} className="w-12 h-12 rounded-full border-2 border-[#1a1a1a] bg-zinc-800" />)}
              </div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="fill-ordr-accent text-ordr-accent" />)}
                </div>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-30">10k+ Careers Built</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-12 border-r border-zinc-100 last:border-r-0 hover:bg-[#fcfaf7] transition-all duration-500 group">
      <div className="text-ordr-accent mb-10 transform group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase mb-4">{title}</h3>
      <p className="text-sm text-zinc-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
