"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col font-sans selection:bg-ordr-accent selection:text-white overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ordr-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ordr-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Navigation */}
      <nav className="h-24 flex items-center justify-between px-10 md:px-20 relative z-10">
        <Link href="/" className="text-3xl font-normal text-ordr-accent text-ordr-serif tracking-tight">
          Rezumy
        </Link>
        <Link href="/signup" className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity">
          Create Account
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <section className="w-full max-w-[1100px] grid lg:grid-cols-[1fr_500px] gap-0 bg-white rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-zinc-100">
           {/* Left Column: Visual/Marketing */}
           <div className="hidden lg:flex flex-col justify-between p-16 bg-zinc-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8">
                 <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-ordr-accent">
                    <Zap size={24} />
                 </div>
              </div>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-ordr-accent" />
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30">Security Protocol</span>
                 </div>
                 <h2 className="text-5xl font-normal text-ordr-serif leading-tight">
                    Access your <span className="italic text-ordr-accent">professional</span> nexus.
                 </h2>
                 <p className="text-zinc-500 font-medium leading-relaxed max-w-sm">
                    Re-enter the editorial suite to continue crafting your professional legacy. Your data remains protected by enterprise-grade encryption.
                 </p>
              </div>
              <div className="pt-12 border-t border-ordr/10 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-ordr-paper bg-zinc-100" />)}
                    </div>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-30">Joined by 10k+ innovators</span>
                 </div>
              </div>
           </div>

           {/* Right Column: Form */}
           <div className="p-10 md:p-16 flex flex-col justify-center">
              <div className="space-y-10">
                 <div className="space-y-2">
                    <h1 className="text-3xl font-normal text-ordr-serif">Journal Entry</h1>
                    <p className="text-xs font-bold tracking-widest uppercase opacity-20">Enter your credentials below</p>
                 </div>

                 <Suspense fallback={<LoadingSpinner />}>
                    <LoginForm />
                 </Suspense>

                 <footer className="pt-8 border-t border-zinc-50 flex flex-col gap-6">
                    <div className="flex items-center gap-3 p-4 bg-ordr-paper/50 rounded-xl border border-ordr/5">
                       <ShieldCheck size={18} className="text-emerald-500" />
                       <span className="text-[10px] font-bold tracking-wider uppercase opacity-40">Biometric Encryption Active</span>
                    </div>
                    <Link href="/" className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30 hover:opacity-100 transition-opacity flex items-center gap-3 group">
                       Back to Homepage
                       <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                 </footer>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
