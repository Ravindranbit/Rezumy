"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Globe } from "lucide-react";
import SignupForm from "@/components/auth/SignupForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col font-sans selection:bg-ordr-accent selection:text-white overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-ordr-accent/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-ordr-accent/5 blur-[100px] rounded-full translate-y-1/2 translate-x-1/2" />

      {/* Navigation */}
      <nav className="h-24 flex items-center justify-between px-10 md:px-20 relative z-10">
        <Link href="/" className="text-3xl font-normal text-ordr-accent text-ordr-serif tracking-tight">
          Rezumy
        </Link>
        <Link href="/login" className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 hover:opacity-100 transition-opacity">
          Member Login
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <section className="w-full max-w-[1100px] grid lg:grid-cols-[500px_1fr] gap-0 bg-white rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-zinc-100">
           {/* Left Column: Form */}
           <div className="p-10 md:p-16 flex flex-col justify-center order-2 lg:order-1">
              <div className="space-y-10">
                 <div className="space-y-2">
                    <h1 className="text-3xl font-normal text-ordr-serif">Initialize Profile</h1>
                    <p className="text-xs font-bold tracking-widest uppercase opacity-20">Begin your professional evolution</p>
                 </div>

                 <Suspense fallback={<LoadingSpinner />}>
                    <SignupForm />
                 </Suspense>

                 <footer className="pt-8 border-t border-zinc-50 flex flex-col gap-6">
                    <Link href="/" className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-30 hover:opacity-100 transition-opacity flex items-center gap-3 group">
                       Return to Core
                       <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                 </footer>
              </div>
           </div>

           {/* Right Column: Visual/Marketing */}
           <div className="hidden lg:flex flex-col justify-between p-16 bg-[#1a1a1a] text-white relative overflow-hidden group order-1 lg:order-2">
              <div className="absolute top-0 right-0 p-8">
                 <div className="w-12 h-12 bg-ordr-accent rounded-xl shadow-lg flex items-center justify-center text-white">
                    <Sparkles size={24} />
                 </div>
              </div>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-ordr-accent" />
                    <span className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-30">Genesis Protocol</span>
                 </div>
                 <h2 className="text-5xl font-normal text-ordr-serif leading-tight">
                    Define your <span className="italic text-ordr-accent">legacy</span> today.
                 </h2>
                 <p className="text-zinc-400 font-medium leading-relaxed max-w-sm">
                    Join the vanguard of professionals who treat their career history as an art form. Your journey deserves high-fidelity representation.
                 </p>
              </div>
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
                    <Globe size={18} className="text-ordr-accent" />
                    <span className="text-[9px] font-bold tracking-widest uppercase opacity-40">Synchronized Global Delivery</span>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
