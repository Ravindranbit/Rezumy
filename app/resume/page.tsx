"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useProfile, useResume } from "@/lib/hooks";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ResumePreview from "@/components/resume/ResumePreview";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import {
  FileText,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Code2,
  FolderOpen,
  UserCircle,
  ArrowUpRight,
  ArrowLeft,
  Download,
  Save,
  CheckCircle2,
  X,
  Zap
} from "lucide-react";
import type {
  ResumePreviewData,
  EducationEntry,
  ExperienceEntry,
  SkillEntry,
  ProjectEntry,
} from "@/types";

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, saving: profileSaving, saveProfile } = useProfile();
  const { resume, loading: resumeLoading, saving: resumeSaving, saveResume } = useResume();

  const [title, setTitle] = useState("My Resume");
  const [summary, setSummary] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initial load
  useEffect(() => {
    if (resume) {
      setTitle(resume.title || "My Resume");
      setSummary(resume.summary || "");
    }
    if (profile) {
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
      setSkills(profile.skills || []);
      setProjects(profile.projects || []);
    }
  }, [resume, profile]);

  const previewData: ResumePreviewData = {
    name: user?.name || "",
    email: user?.email || "",
    phone,
    location,
    summary,
    education,
    experience,
    skills,
    projects,
  };

  const handleSaveAll = useCallback(async () => {
    setSaved(false);
    const [resumeRes, profileRes] = await Promise.all([
      saveResume({ title, summary }),
      saveProfile({ phone, location, education, experience, skills, projects }),
    ]);

    if (!resumeRes.error && !profileRes.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }, [title, summary, phone, location, education, experience, skills, projects, saveResume, saveProfile]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(previewData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to generate PDF");
        setDownloading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(user?.name || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF. Please try again.");
    }
    setDownloading(false);
  };

  if (profileLoading || resumeLoading) return <LoadingSpinner />;

  const isSaving = resumeSaving || profileSaving;

  return (
    <div className="flex flex-col h-screen bg-[#fcfaf7] font-sans antialiased text-zinc-900">
      {/* Top bar */}
      <header className="h-24 bg-white border-b border-zinc-100 flex items-center justify-between px-10 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-10">
          <Link href="/dashboard" className="opacity-20 hover:opacity-100 transition-opacity">
            <ArrowLeft size={18} />
          </Link>
          <div className="h-8 w-px bg-zinc-100" />
          <h1 className="text-ordr-serif text-2xl font-normal tracking-tight">Editorial Builder</h1>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-bold tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 size={12} />
              Saved
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6">
           <button
             onClick={() => setShowPreview(!showPreview)}
             className="lg:hidden text-[10px] font-bold tracking-widest uppercase text-zinc-400 px-4 py-2 border border-zinc-100 rounded-md"
           >
             {showPreview ? "Edit" : "Preview"}
           </button>
           <button 
             onClick={handleSaveAll} 
             disabled={isSaving}
             className="bg-white border border-zinc-200 text-zinc-700 px-8 py-3 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-zinc-50 transition-all disabled:opacity-50"
           >
             {isSaving ? "Saving..." : "Save Draft"}
           </button>
           <button 
             onClick={handleDownloadPDF}
             disabled={downloading}
             className="bg-ordr-accent text-white px-8 py-3 rounded-md text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-zinc-900 transition-all shadow-xl shadow-ordr-accent/20 flex items-center gap-3"
           >
             <Download size={14} />
             {downloading ? "Exporting..." : "Export PDF"}
           </button>
        </div>
      </header>

      {/* Main split area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Sidebar */}
        <aside className={`w-full lg:w-[480px] bg-white border-r border-zinc-100 flex flex-col shrink-0 overflow-y-auto ${showPreview ? "hidden lg:flex" : "flex"}`}>
          <div className="p-12 space-y-16 pb-32">
            {/* Core Info */}
            <Section icon={<FileText size={20} className="text-ordr-accent" />} title="Executive Identity">
              <div className="space-y-8">
                <Input
                  label="Professional Title"
                  placeholder="e.g. Senior Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Brief Manifesto</label>
                   <textarea
                     className="w-full h-40 p-6 bg-[#fcfaf7] border border-zinc-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-ordr-accent font-medium italic opacity-80 resize-none transition-all"
                     placeholder="Synthesize your professional value proposition..."
                     value={summary}
                     onChange={(e) => setSummary(e.target.value)}
                   />
                </div>
              </div>
            </Section>

            {/* Contact */}
            <Section icon={<UserCircle size={20} className="text-ordr-accent" />} title="Active Channels">
              <div className="grid grid-cols-2 gap-8">
                <Input
                  label="Active Line"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Current Hub"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </Section>

            {/* Experience */}
            <Section 
              icon={<Briefcase size={20} className="text-ordr-accent" />} 
              title="Deployment History"
              action={
                <button 
                  onClick={() => setExperience([...experience, { company: "", role: "", description: "", startDate: "", endDate: "" }])}
                  className="text-ordr-accent hover:opacity-100 opacity-40 transition-opacity"
                >
                  <Plus size={20} />
                </button>
              }
            >
              <div className="space-y-8">
                {experience.map((exp, i) => (
                  <EntryCard key={i} onRemove={() => setExperience(experience.filter((_, idx) => idx !== i))}>
                    <div className="space-y-6">
                      <Input
                        label="Organization"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[i] = { ...exp, company: e.target.value };
                          setExperience(updated);
                        }}
                      />
                      <div className="grid grid-cols-2 gap-8">
                        <Input
                          label="Designation"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[i] = { ...exp, role: e.target.value };
                            setExperience(updated);
                          }}
                        />
                         <Input
                          label="Timeline"
                          placeholder="e.g. 2021 - Present"
                          value={`${exp.startDate}${exp.startDate && exp.endDate ? " - " : ""}${exp.endDate}`}
                          onChange={(e) => {
                            const parts = e.target.value.split(" - ");
                            const updated = [...experience];
                            updated[i] = { ...exp, startDate: parts[0] || "", endDate: parts[1] || "" };
                            setExperience(updated);
                          }}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Operational Impact</label>
                        <textarea
                          className="w-full h-32 p-6 bg-white border border-zinc-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-ordr-accent font-medium italic opacity-80"
                          placeholder="Describe your achievements..."
                          value={exp.description}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[i] = { ...exp, description: e.target.value };
                            setExperience(updated);
                          }}
                        />
                      </div>
                    </div>
                  </EntryCard>
                ))}
              </div>
            </Section>

            {/* Skills */}
            <Section 
              icon={<Code2 size={20} className="text-ordr-accent" />} 
              title="Skill Protocols"
              action={
                <button 
                  onClick={() => setSkills([...skills, { name: "" }])}
                  className="text-ordr-accent hover:opacity-100 opacity-40 transition-opacity"
                >
                  <Plus size={20} />
                </button>
              }
            >
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-zinc-100 px-5 py-2.5 rounded-lg group hover:border-ordr-accent transition-all">
                    <input
                      className="bg-transparent text-[10px] font-bold tracking-widest uppercase text-zinc-700 outline-none w-24"
                      value={skill.name}
                      onChange={(e) => {
                        const updated = [...skills];
                        updated[i] = { name: e.target.value };
                        setSkills(updated);
                      }}
                    />
                    <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className="text-zinc-300 hover:text-ordr-accent">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            {/* Projects */}
            <Section 
              icon={<FolderOpen size={20} className="text-ordr-accent" />} 
              title="Case Studies"
              action={
                <button 
                  onClick={() => setProjects([...projects, { title: "", description: "", techStack: "" }])}
                  className="text-ordr-accent hover:opacity-100 opacity-40 transition-opacity"
                >
                  <Plus size={20} />
                </button>
              }
            >
              <div className="space-y-8">
                {projects.map((proj, i) => (
                  <EntryCard key={i} onRemove={() => setProjects(projects.filter((_, idx) => idx !== i))}>
                    <div className="space-y-6">
                      <Input
                        label="Initiative"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[i] = { ...proj, title: e.target.value };
                          setProjects(updated);
                        }}
                      />
                      <Input
                        label="Stack Node"
                        placeholder="React, Node.js..."
                        value={proj.techStack}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[i] = { ...proj, techStack: e.target.value };
                          setProjects(updated);
                        }}
                      />
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Protocol Scope</label>
                        <textarea
                          className="w-full h-32 p-6 bg-white border border-zinc-100 rounded-xl text-sm outline-none focus:ring-1 focus:ring-ordr-accent font-medium italic opacity-80"
                          placeholder="Describe the initiative..."
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[i] = { ...proj, description: e.target.value };
                            setProjects(updated);
                          }}
                        />
                      </div>
                    </div>
                  </EntryCard>
                ))}
              </div>
            </Section>
          </div>
        </aside>

        {/* Live Preview */}
        <main className={`flex-1 bg-[#fcfaf7] overflow-y-auto p-16 lg:p-32 ${!showPreview ? "hidden lg:flex" : "flex"} flex-col items-center`}>
           <div className="w-full max-w-[850px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] bg-white border border-zinc-100">
              <ResumePreview data={previewData} />
           </div>
           <div className="mt-20 text-[10px] font-bold text-zinc-200 uppercase tracking-[0.8em] flex items-center gap-8">
             <div className="h-px w-12 bg-zinc-100" />
             Editorial Preview Protocol
             <div className="h-px w-12 bg-zinc-100" />
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({ icon, title, action, children }: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-10 group">
      <div className="flex items-center justify-between border-b border-zinc-50 pb-6">
        <div className="flex items-center gap-5">
          <span className="opacity-40 group-hover:opacity-100 transition-opacity">{icon}</span>
          <h2 className="text-ordr-serif text-3xl font-normal text-zinc-900 tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

function EntryCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="p-10 bg-[#fcfaf7]/50 border border-zinc-50 rounded-2xl relative group/card hover:bg-white hover:border-zinc-100 transition-all duration-500">
      <button onClick={onRemove} className="absolute top-6 right-6 text-zinc-200 hover:text-ordr-accent opacity-0 group-hover/card:opacity-100 transition-all p-2">
        <Trash2 size={16} />
      </button>
      {children}
    </div>
  );
}
