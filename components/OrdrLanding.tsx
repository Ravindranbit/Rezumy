"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X, FileText, Shield, Download, CheckCircle2 } from "lucide-react";
import GitHubIcon from "@/components/ui/GitHubIcon";

export default function RezumyLanding() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="bg-ordr-paper min-h-screen text-ordr-text selection:bg-ordr-accent selection:text-white overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] border-b border-ordr bg-ordr-paper/80 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex-1 hidden md:flex items-center gap-8 text-[11px] font-bold tracking-[0.2em] uppercase">
            <Link href="/login" className="hover:text-ordr-accent transition-colors">Templates</Link>
            <Link href="/login" className="hover:text-ordr-accent transition-colors">Features</Link>
            <Link href="/login" className="hover:text-ordr-accent transition-colors">Pricing</Link>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-ordr-script text-[28px] text-ordr-accent mt-1">Rezumy</span>
          </div>

          <div className="flex-1 flex justify-end items-center gap-8">
            <div className="hidden md:flex items-center gap-4 border-r border-ordr pr-8 text-[11px] font-bold tracking-[0.2em] uppercase">
              <Link href="/login" className="hover:text-ordr-accent transition-colors">Log In</Link>
              <Link href="https://github.com" target="_blank" className="hover:text-ordr-accent transition-colors flex items-center gap-2">
                <GitHubIcon size={14} />
                GitHub
              </Link>
            </div>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/signup" className="hidden md:block text-[11px] font-bold tracking-[0.2em] uppercase bg-ordr-text text-white px-6 py-3 hover:bg-ordr-accent transition-all duration-500">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20">
        <section className="relative overflow-hidden border-b border-ordr bg-[radial-gradient(circle_at_top_right,#e43d5d05,transparent_50%)]">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#2d2d2d 1px, transparent 1px), linear-gradient(90deg, #2d2d2d 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="max-w-[1800px] mx-auto px-6 py-24 md:py-40 relative z-10">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="text-left animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
                <div className="mb-8 inline-flex items-center gap-3 border border-ordr px-4 py-2 text-[10px] font-bold tracking-[0.4em] uppercase opacity-70 bg-white/50 backdrop-blur-sm rounded-full">
                  <span className="w-2 h-2 rounded-full bg-ordr-accent animate-pulse shadow-[0_0_8px_rgba(228,61,93,0.5)]" />
                  Rezumy 1.0 is now live
                </div>
                
                <h1 className="text-ordr-serif text-6xl md:text-8xl leading-tight font-normal tracking-tight mb-12">
                  The <span className="italic">editorial</span> canvas for your <span className="italic">career</span>.
                </h1>
                
                <p className="text-lg md:text-2xl max-w-xl mb-16 opacity-60 leading-relaxed font-medium">
                  Stop fighting with formatting. Create a resume that feels like a premium publication — sharp, focused, and impossible to ignore.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <Link href="/signup" className="w-full sm:w-auto text-[11px] font-bold tracking-[0.4em] uppercase bg-ordr-text text-white px-12 py-6 hover:bg-ordr-accent transition-all duration-700 flex items-center justify-center gap-4 group shadow-xl hover:shadow-ordr-accent/20">
                    Start Building
                    <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Link>
                  <div className="flex items-center gap-6 text-[10px] font-bold tracking-[0.2em] uppercase opacity-40">
                    <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-ordr-accent" /> Professional PDF</div>
                    <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-ordr-accent" /> No Clutter</div>
                  </div>
                </div>
              </div>

              <div className="relative group perspective-1000 hidden lg:block animate-in fade-in zoom-in-95 duration-1000 ease-out delay-200">
                <div className="relative z-10 transition-all duration-700 transform hover:rotate-y-[-5deg] hover:rotate-x-[2deg] hover:scale-[1.02]">
                  <div className="p-2 bg-white rounded-[2rem] shadow-[0_32px_80px_rgba(0,0,0,0.1)] border border-ordr">
                    <Image 
                      src="/rezumy_hero_mockup_1778862652566.png" 
                      alt="Rezumy Interface Mockup" 
                      width={1200} 
                      height={900} 
                      className="rounded-[1.8rem] w-full"
                      priority
                    />
                  </div>
                  
                  {/* Floating elements for depth */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-ordr-accent/5 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-slate-200/20 rounded-full blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quadrant Section - Core Features */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 border-b border-ordr">
          <QuadrantItem 
            number="01" 
            title="Live Preview" 
            icon={<FileText size={24} />}
            desc="See every edit reflected instantly so you can fine-tune spacing, hierarchy, and readability with confidence."
          />
          <QuadrantItem 
            number="02" 
            title="ATS Structure" 
            icon={<Shield size={24} />}
            desc="Simple, semantic layouts keep your resume readable by both recruiters and automated screening tools."
          />
          <QuadrantItem 
            number="03" 
            title="One-Click Export" 
            icon={<Download size={24} />}
            desc="Generate a polished PDF instantly with consistent typography, spacing, and print-ready formatting."
          />
        </section>

        {/* Story Section */}
        <section className="max-w-[1800px] mx-auto grid md:grid-cols-2">
          <div className="border-r border-ordr p-6 md:p-24 flex flex-col justify-between min-h-[600px] group cursor-pointer bg-ordr-paper">
            <div className="relative aspect-[4/3] overflow-hidden grayscale border border-ordr p-1 bg-white hover:grayscale-0 transition-all duration-700 mb-12">
               <div className="absolute inset-0 flex flex-col p-12 overflow-hidden bg-slate-50/50">
                  <div className="border-b border-ordr pb-6 mb-8 flex justify-between items-end">
                    <div className="w-1/2 h-8 bg-ordr-text/10" />
                    <div className="w-12 h-12 bg-ordr-text" />
                  </div>
                  <div className="space-y-4">
                    <div className="w-full h-4 bg-ordr-text/5" />
                    <div className="w-full h-4 bg-ordr-text/5" />
                    <div className="w-3/4 h-4 bg-ordr-text/5" />
                  </div>
                  <div className="mt-12 space-y-6">
                    <div className="w-1/3 h-6 bg-ordr-text/10" />
                    <div className="space-y-3">
                       <div className="w-full h-3 bg-ordr-text/5" />
                       <div className="w-full h-3 bg-ordr-text/5" />
                    </div>
                  </div>
                  <div className="absolute bottom-12 right-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-ordr-accent font-bold tracking-widest text-[10px] uppercase">
                    Preview Mode <ArrowUpRight size={14} />
                  </div>
               </div>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4 opacity-50">Flow #1</p>
              <h2 className="text-ordr-serif text-4xl md:text-6xl font-medium leading-tight mb-8">
                Designed for job seekers who value <span className="italic">precision</span>.
              </h2>
              <div className="flex items-center gap-4 group-hover:gap-6 transition-all duration-500">
                <span className="text-[11px] font-bold tracking-widest uppercase">Start Building Now</span>
                <ArrowUpRight size={16} />
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-24 flex flex-col justify-between min-h-[600px] bg-ordr-text text-ordr-bg">
            <div>
              <div className="w-12 h-12 border border-ordr-bg/20 flex items-center justify-center mb-12">
                <span className="text-xs italic font-serif">R</span>
              </div>
              <h2 className="text-ordr-serif text-4xl md:text-6xl font-medium leading-tight mb-8">
                "Less friction, more momentum. Your story deserves a better canvas."
              </h2>
            </div>
            <div className="flex flex-col gap-8">
              <p className="text-lg opacity-60 max-w-md">
                Rezumy keeps the attention on your content while making the next step obvious. Built in public for the modern professional.
              </p>
              <div className="flex gap-12">
                <div>
                  <p className="text-3xl font-serif">100%</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">ATS Friendly</p>
                </div>
                <div>
                  <p className="text-3xl font-serif">0s</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">Load Time</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto / Steps Section */}
        <section className="py-24 md:py-48 border-b border-ordr">
          <div className="max-w-[1800px] mx-auto px-6">
             <div className="grid md:grid-cols-3 gap-24">
                <StepItem number="01" title="Sign up quickly" desc="Create your account and get into the builder in seconds." />
                <StepItem number="02" title="Add your story" desc="Enter experience, education, and skills in a clean editor." />
                <StepItem number="03" title="Export resume" desc="Download a crisp PDF and send it with confidence." />
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-ordr">
        <div className="max-w-[1800px] mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-ordr-script text-[28px] text-ordr-accent mt-1">Rezumy</span>
            </div>
            <p className="text-sm opacity-50 max-w-xs mb-12 uppercase font-bold tracking-widest leading-loose">
              Smart resume builder for the modern career. High performance, zero clutter.
            </p>
            <div className="flex gap-6 text-[10px] font-bold tracking-widest uppercase">
              <Link href="https://github.com" target="_blank" className="hover:text-ordr-accent transition-colors">GitHub</Link>
              <Link href="#" className="hover:text-ordr-accent transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-ordr-accent transition-colors">LinkedIn</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8 opacity-40">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/login" className="hover:translate-x-1 inline-block transition-transform">Templates</Link></li>
              <li><Link href="/login" className="hover:translate-x-1 inline-block transition-transform">Features</Link></li>
              <li><Link href="/login" className="hover:translate-x-1 inline-block transition-transform">Pricing</Link></li>
              <li><Link href="/login" className="hover:translate-x-1 inline-block transition-transform">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8 opacity-40">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="#" className="hover:translate-x-1 inline-block transition-transform">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:translate-x-1 inline-block transition-transform">Terms of Service</Link></li>
              <li><Link href="#" className="hover:translate-x-1 inline-block transition-transform">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1800px] mx-auto px-6 mt-20 pt-10 border-t border-ordr flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-[10px] font-bold tracking-widest uppercase">
          <p>© {new Date().getFullYear()} Rezumy. Open source on GitHub.</p>
          <p>Designed with Intent</p>
        </div>
      </footer>
    </div>
  );
}

function QuadrantItem({ number, title, desc, icon }: { number: string; title: string; desc: string, icon: React.ReactNode }) {
  return (
    <div className="border-r border-ordr last:border-r-0 p-8 md:p-12 min-h-[350px] flex flex-col justify-between group hover:bg-ordr-text hover:text-ordr-bg transition-all duration-700 cursor-pointer">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold tracking-[0.4em] opacity-40 group-hover:text-ordr-accent transition-colors">{number}</span>
        <div className="opacity-20 group-hover:opacity-100 group-hover:text-ordr-accent transition-all duration-500">
           {icon}
        </div>
      </div>
      <div>
        <h3 className="text-ordr-serif text-2xl md:text-3xl font-medium mb-4">{title}</h3>
        <p className="text-sm opacity-60 leading-relaxed max-w-[280px]">{desc}</p>
      </div>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-6">
       <span className="text-ordr-accent text-xs font-bold tracking-widest uppercase">Step {number}</span>
       <h3 className="text-ordr-serif text-3xl font-medium">{title}</h3>
       <p className="opacity-50 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
