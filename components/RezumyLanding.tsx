"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X, FileText, Shield, Download, CheckCircle2, Zap, Target, Activity, Cpu } from "lucide-react";
import GitHubIcon from "@/components/ui/GitHubIcon";

export default function RezumyLanding() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white overflow-x-hidden font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] border-b border-black/[0.03] bg-white/80 backdrop-blur-2xl">
        <div className="max-w-[1800px] mx-auto px-10 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-black tracking-[-0.1em] uppercase transition-all group-hover:tracking-normal">REZUMY</span>
            <div className="w-2 h-2 bg-black rounded-full" />
          </Link>
          
          <div className="hidden md:flex items-center gap-16 text-[10px] font-black tracking-[0.4em] uppercase opacity-40">
            <Link href="/login" className="hover:opacity-100 transition-opacity">ARCHIVE</Link>
            <Link href="/login" className="hover:opacity-100 transition-opacity">PROTOCOLS</Link>
            <Link href="/login" className="hover:opacity-100 transition-opacity">INTEL</Link>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-10 border-r border-black/5 pr-10">
              <Link href="/login" className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40 hover:opacity-100 transition-opacity">AUTHENTICATE</Link>
            </div>
            <Link href="/signup" className="hidden md:block text-[11px] font-black tracking-[0.3em] uppercase bg-black text-white px-10 py-4 rounded-full hover:scale-105 transition-all duration-500 shadow-2xl shadow-black/20">
              INITIALIZE
            </Link>
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="relative min-h-[90vh] flex flex-col justify-center border-b border-black/[0.03] px-10">
          <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <pattern id="grid-hero" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-hero)" />
            </svg>
          </div>
          
          <div className="max-w-[1800px] mx-auto w-full relative z-10 py-32">
            <div className="space-y-12">
               <div className="inline-flex items-center gap-4 bg-black text-white px-6 py-2 rounded-full text-[9px] font-black tracking-[0.5em] uppercase">
                  <Activity size={12} className="animate-pulse" />
                  SYSTEM_STATUS: ACTIVE // CORE_V1.0
               </div>
               
               <h1 className="text-[8rem] md:text-[14rem] font-black tracking-[-0.08em] leading-[0.8] uppercase italic">
                  THE <span className="text-black/10">EDITORIAL</span> <br />
                  SYNERGY.
               </h1>
               
               <div className="grid lg:grid-cols-2 gap-24 items-end">
                  <p className="text-3xl md:text-5xl font-black tracking-tighter text-black/40 leading-[0.9] uppercase italic max-w-2xl">
                     High-fidelity resume engineering for elite technical operators. Build your professional DNA with absolute precision.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-8 lg:justify-end">
                    <Link href="/signup" className="w-full sm:w-auto text-[12px] font-black tracking-[0.4em] uppercase bg-black text-white px-16 py-8 rounded-full hover:scale-105 transition-all duration-700 flex items-center justify-center gap-6 group shadow-luxury">
                      START_SCAN
                      <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-8 text-[9px] font-black tracking-[0.3em] uppercase opacity-20">
                       <span className="flex items-center gap-3"><Shield size={14} /> ATS_SYNC</span>
                       <span className="flex items-center gap-3"><Zap size={14} /> INSTANT_RENDER</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="grid md:grid-cols-3 border-b border-black/[0.03]">
          <FeatureBlock 
            index="01"
            title="REALTIME_SYNTHESIS"
            desc="Every keystroke is mapped in high-fidelity. Zero latency between intent and professional render."
          />
          <FeatureBlock 
            index="02"
            title="ATS_OPTIMIZED_LOGIC"
            desc="Architectural semantic structures that bridge the gap between human recruiters and automated nodes."
          />
          <FeatureBlock 
            index="03"
            title="EXPORT_PROTOCOL"
            desc="One-click deployment of professional assets in standardized high-yield formats."
          />
        </section>

        {/* Large Visual Section */}
        <section className="py-48 px-10 border-b border-black/[0.03] bg-zinc-50/30">
          <div className="max-w-[1800px] mx-auto">
             <div className="flex flex-col gap-24">
                <div className="flex items-center gap-6">
                   <div className="h-px flex-1 bg-black/10" />
                   <span className="text-[10px] font-black tracking-[0.5em] uppercase opacity-20">VISUAL_INTELLIGENCE</span>
                   <div className="h-px flex-1 bg-black/10" />
                </div>
                
                <div className="relative group rounded-[4rem] overflow-hidden border border-black/[0.03] shadow-luxury aspect-[16/9] bg-white">
                   <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10" />
                   <Image 
                     src="/rezumy_hero_mockup_1778862652566.png" 
                     alt="Rezumy Interface" 
                     fill 
                     className="object-cover transition-transform duration-1000 group-hover:scale-105"
                   />
                   <div className="absolute bottom-16 left-16 z-20">
                      <div className="bg-black text-white p-8 rounded-[2rem] shadow-2xl space-y-4 max-w-sm">
                         <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">NODE_01 // EDITOR</p>
                         <h3 className="text-3xl font-black tracking-tighter uppercase italic">CANVAS_CONTROL.</h3>
                         <p className="text-sm font-medium text-white/60 leading-relaxed uppercase">Direct manipulation of professional data with immediate structural feedback.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Technical Manifesto */}
        <section className="py-64 px-10">
           <div className="max-w-[1800px] mx-auto grid lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-16">
                 <h2 className="text-[6rem] font-black tracking-[-0.08em] leading-[0.85] uppercase italic">
                    LESS_CLUTTER. <br />
                    <span className="text-black/10">MORE_INTENT.</span>
                 </h2>
                 <p className="text-2xl font-medium text-black/40 uppercase leading-tight max-w-xl italic">
                   "We have stripped away the unnecessary to reveal the essential. Your career is not a template; it is a high-performance asset."
                 </p>
                 <div className="flex gap-16">
                    <div>
                       <p className="text-[5rem] font-black tracking-tighter leading-none">100%</p>
                       <p className="text-[9px] font-black tracking-[0.4em] uppercase opacity-20">ATS_PENETRATION</p>
                    </div>
                    <div>
                       <p className="text-[5rem] font-black tracking-tighter leading-none">0.2s</p>
                       <p className="text-[9px] font-black tracking-[0.4em] uppercase opacity-20">LATENCY_SYNC</p>
                    </div>
                 </div>
              </div>
              <div className="bg-black text-white p-24 rounded-[5rem] shadow-luxury space-y-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/[0.05] transition-all duration-1000" />
                 <Cpu size={48} className="text-white/20" />
                 <h3 className="text-5xl font-black tracking-tighter uppercase italic leading-[0.9]">
                    THE_FUTURE_OF <br /> PROFESSIONAL <br /> ARCHITECTURE.
                 </h3>
                 <p className="text-lg text-white/40 font-medium uppercase leading-relaxed max-w-md">
                    Join the network of elite developers and operators who treat their resume as a critical component of their technical stack.
                 </p>
                 <Link href="/signup" className="inline-flex items-center gap-6 text-[11px] font-black tracking-[0.4em] uppercase border border-white/20 px-12 py-6 rounded-full hover:bg-white hover:text-black transition-all">
                    INITIATE_SESSION
                    <ArrowUpRight size={18} />
                 </Link>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-32 px-10 border-t border-black/[0.03] bg-zinc-50/50">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid md:grid-cols-4 gap-24 mb-32">
            <div className="col-span-2 space-y-12">
              <Link href="/" className="flex items-center gap-3 group">
                <span className="text-3xl font-black tracking-[-0.1em] uppercase transition-all group-hover:tracking-normal">REZUMY</span>
                <div className="w-2.5 h-2.5 bg-black rounded-full" />
              </Link>
              <p className="text-sm font-bold text-black/30 max-w-xs uppercase tracking-widest leading-loose">
                Professional intelligence suite for modern technical operators. High performance, zero friction.
              </p>
              <div className="flex gap-10 text-[9px] font-black tracking-[0.4em] uppercase opacity-40">
                <Link href="#" className="hover:text-black transition-colors">GITHUB</Link>
                <Link href="#" className="hover:text-black transition-colors">X_INTEL</Link>
                <Link href="#" className="hover:text-black transition-colors">LINKEDIN</Link>
              </div>
            </div>
            
            <div className="space-y-10">
              <h4 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-20">WORKSPACE</h4>
              <ul className="space-y-6 text-[11px] font-black tracking-[0.2em] uppercase">
                <li><Link href="/login" className="hover:opacity-40 transition-opacity">ARCHIVE</Link></li>
                <li><Link href="/login" className="hover:opacity-40 transition-opacity">SOURCE</Link></li>
                <li><Link href="/login" className="hover:opacity-40 transition-opacity">INTEL</Link></li>
              </ul>
            </div>
            
            <div className="space-y-10">
              <h4 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-20">LEGAL_SYNC</h4>
              <ul className="space-y-6 text-[11px] font-black tracking-[0.2em] uppercase">
                <li><Link href="#" className="hover:opacity-40 transition-opacity">PRIVACY_PROTOCOL</Link></li>
                <li><Link href="#" className="hover:opacity-40 transition-opacity">TERMS_OF_SERVICE</Link></li>
                <li><Link href="#" className="hover:opacity-40 transition-opacity">SECURITY_NODE</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-16 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 text-[9px] font-black tracking-[0.5em] uppercase">
            <p>© {new Date().getFullYear()} REZUMY_GLOBAL_SYSTEMS // ALL_RIGHTS_RESERVED</p>
            <p>DESIGNED_WITH_ABSOLUTE_INTENT</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureBlock({ index, title, desc }: { index: string; title: string; desc: string }) {
  return (
    <div className="border-r border-black/[0.03] last:border-r-0 p-16 space-y-12 group hover:bg-black hover:text-white transition-all duration-700 cursor-default">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black tracking-[0.5em] opacity-20 group-hover:text-white/40 transition-colors">{index}</span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700">
           <ArrowUpRight size={24} />
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-4xl font-black tracking-tighter uppercase italic">{title}</h3>
        <p className="text-[11px] font-medium opacity-40 group-hover:opacity-60 transition-opacity leading-relaxed uppercase">{desc}</p>
      </div>
    </div>
  );
}
