"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/lib/hooks";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Plus, Trash2, CheckCircle, GraduationCap, Briefcase, Code2, FolderOpen, UserCircle, ArrowUpRight } from "lucide-react";
import type {
  EducationEntry,
  ExperienceEntry,
  SkillEntry,
  ProjectEntry,
} from "@/types";

export default function ProfilePage() {
  const { profile, loading, saving, saveProfile } = useProfile();
  const [saved, setSaved] = useState(false);

  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([]);

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
      setSkills(profile.skills || []);
      setProjects(profile.projects || []);
    }
  }, [profile]);

  const handleSave = async () => {
    setSaved(false);
    const { error } = await saveProfile({
      phone,
      location,
      education,
      experience,
      skills,
      projects,
    });
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-16">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-12 border-b border-ordr">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 mb-4">Account / Profile</p>
          <h1 className="text-ordr-serif text-5xl font-medium tracking-tight">
            Personal <span className="italic">Archive</span>
          </h1>
          <p className="text-sm font-medium opacity-60 mt-4 max-w-md italic font-serif">
            "Your history is your most valuable asset. Document your professional journey with precision and clarity."
          </p>
        </div>
        <div className="mt-8 md:mt-0">
          <Button onClick={handleSave} loading={saving} className="px-12">
            {saved ? "Profile Saved" : "Save Archive"}
          </Button>
        </div>
      </div>

      <div className="space-y-24">
        {/* ── Personal Information ─────────────────────────── */}
        <Section icon={<UserCircle size={18} />} title="Core Identity">
          <div className="grid sm:grid-cols-2 gap-12">
            <Input
              id="phone"
              label="Secure Phone"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              id="location"
              label="Primary Location"
              placeholder="San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </Section>

        {/* ── Experience ───────────────────────────────────── */}
        <Section
          icon={<Briefcase size={18} />}
          title="Professional Experience"
          action={
            <button
              onClick={() =>
                setExperience([
                  ...experience,
                  {
                    company: "",
                    role: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                  },
                ])
              }
              className="text-[10px] font-bold tracking-widest text-ordr-accent hover:opacity-60 transition-opacity flex items-center gap-2"
            >
              <Plus size={14} /> ADD POSITION
            </button>
          }
        >
          {experience.length === 0 ? (
            <EmptyState text="No professional records found." />
          ) : (
            <div className="space-y-12">
              {experience.map((exp, i) => (
                <EntryCard
                  key={i}
                  onRemove={() =>
                    setExperience(experience.filter((_, idx) => idx !== i))
                  }
                >
                  <div className="grid sm:grid-cols-2 gap-8 mb-8">
                    <Input
                      label="Organization"
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[i] = { ...exp, company: e.target.value };
                        setExperience(updated);
                      }}
                    />
                    <Input
                      label="Functional Title"
                      placeholder="e.g. Lead Engineer"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[i] = { ...exp, role: e.target.value };
                        setExperience(updated);
                      }}
                    />
                    <Input
                      label="Commencement"
                      placeholder="e.g. Jan 2021"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[i] = { ...exp, startDate: e.target.value };
                        setExperience(updated);
                      }}
                    />
                    <Input
                      label="Conclusion"
                      placeholder="e.g. Present"
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[i] = { ...exp, endDate: e.target.value };
                        setExperience(updated);
                      }}
                    />
                  </div>
                  <Textarea
                    label="Operational Summary"
                    placeholder="Describe your impact and key achievements..."
                    value={exp.description}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[i] = { ...exp, description: e.target.value };
                      setExperience(updated);
                    }}
                  />
                </EntryCard>
              ))}
            </div>
          )}
        </Section>

        {/* ── Education ────────────────────────────────────── */}
        <Section
          icon={<GraduationCap size={18} />}
          title="Academic Foundations"
          action={
            <button
              onClick={() =>
                setEducation([
                  ...education,
                  { institution: "", degree: "", startDate: "", endDate: "" },
                ])
              }
              className="text-[10px] font-bold tracking-widest text-ordr-accent hover:opacity-60 transition-opacity flex items-center gap-2"
            >
              <Plus size={14} /> ADD EDUCATION
            </button>
          }
        >
          {education.length === 0 ? (
            <EmptyState text="No academic records found." />
          ) : (
            <div className="space-y-12">
              {education.map((edu, i) => (
                <EntryCard
                  key={i}
                  onRemove={() =>
                    setEducation(education.filter((_, idx) => idx !== i))
                  }
                >
                  <div className="grid sm:grid-cols-2 gap-8">
                    <Input
                      label="Institution"
                      placeholder="University Name"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[i] = { ...edu, institution: e.target.value };
                        setEducation(updated);
                      }}
                    />
                    <Input
                      label="Degree / Major"
                      placeholder="e.g. B.S. Computer Science"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[i] = { ...edu, degree: e.target.value };
                        setEducation(updated);
                      }}
                    />
                    <Input
                      label="Start"
                      placeholder="2020"
                      value={edu.startDate}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[i] = { ...edu, startDate: e.target.value };
                        setEducation(updated);
                      }}
                    />
                    <Input
                      label="End"
                      placeholder="2024"
                      value={edu.endDate}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[i] = { ...edu, endDate: e.target.value };
                        setEducation(updated);
                      }}
                    />
                  </div>
                </EntryCard>
              ))}
            </div>
          )}
        </Section>

        {/* ── Skills ───────────────────────────────────────── */}
        <Section
          icon={<Code2 size={18} />}
          title="Core Competencies"
          action={
            <button
              onClick={() => setSkills([...skills, { name: "" }])}
              className="text-[10px] font-bold tracking-widest text-ordr-accent hover:opacity-60 transition-opacity flex items-center gap-2"
            >
              <Plus size={14} /> ADD SKILL
            </button>
          }
        >
          {skills.length === 0 ? (
            <EmptyState text="No competencies defined." />
          ) : (
            <div className="flex flex-wrap gap-4">
              {skills.map((skill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border border-ordr px-6 py-3 bg-white/40 group/skill hover:bg-white transition-all duration-300"
                >
                  <input
                    className="bg-transparent text-[11px] font-bold tracking-[0.2em] uppercase outline-none w-32 min-w-0"
                    placeholder="Competency"
                    value={skill.name}
                    onChange={(e) => {
                      const updated = [...skills];
                      updated[i] = { name: e.target.value };
                      setSkills(updated);
                    }}
                  />
                  <button
                    onClick={() =>
                      setSkills(skills.filter((_, idx) => idx !== i))
                    }
                    className="text-ordr-red/20 hover:text-ordr-red transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Projects ─────────────────────────────────────── */}
        <Section
          icon={<FolderOpen size={18} />}
          title="Selected Projects"
          action={
            <button
              onClick={() =>
                setProjects([
                  ...projects,
                  { title: "", description: "", techStack: "" },
                ])
              }
              className="text-[10px] font-bold tracking-widest text-ordr-accent hover:opacity-60 transition-opacity flex items-center gap-2"
            >
              <Plus size={14} /> ADD PROJECT
            </button>
          }
        >
          {projects.length === 0 ? (
            <EmptyState text="No projects documented." />
          ) : (
            <div className="space-y-12">
              {projects.map((proj, i) => (
                <EntryCard
                  key={i}
                  onRemove={() =>
                    setProjects(projects.filter((_, idx) => idx !== i))
                  }
                >
                  <div className="grid sm:grid-cols-2 gap-8 mb-8">
                    <Input
                      label="Project Nomenclature"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[i] = { ...proj, title: e.target.value };
                        setProjects(updated);
                      }}
                    />
                    <Input
                      label="Technological Stack"
                      placeholder="e.g. React, PostgreSQL"
                      value={proj.techStack}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[i] = { ...proj, techStack: e.target.value };
                        setProjects(updated);
                      }}
                    />
                  </div>
                  <Textarea
                    label="Implementation Narrative"
                    placeholder="Describe the objective and your technical contribution..."
                    value={proj.description}
                    onChange={(e) => {
                      const updated = [...projects];
                      updated[i] = { ...proj, description: e.target.value };
                      setProjects(updated);
                    }}
                  />
                </EntryCard>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Bottom save */}
      <div className="mt-24 pt-12 border-t border-ordr flex justify-between items-center">
         <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 italic font-serif">
            "Every entry is a proof of capability."
         </p>
         <Button onClick={handleSave} loading={saving} size="lg" className="px-16">
            Commit All Changes
         </Button>
      </div>
    </div>
  );
}

// ─── Reusable Sub-Components ─────────────────────────────

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-12 pb-4 border-b border-ordr">
        <div className="flex items-center gap-6">
          <span className="opacity-30 group-hover:opacity-100 group-hover:text-ordr-accent transition-all duration-500">{icon}</span>
          <h2 className="text-ordr-serif text-3xl font-medium tracking-tight">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}

function EntryCard({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <div className="p-10 border border-ordr relative bg-white/10 hover:bg-white/30 transition-all duration-500 group/card">
      <button
        onClick={onRemove}
        className="absolute top-6 right-6 text-ordr-red/20 hover:text-ordr-red transition-colors opacity-0 group-hover/card:opacity-100"
      >
        <Trash2 size={18} />
      </button>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-12 border border-dashed border-ordr/30 text-center">
       <p className="text-[11px] font-bold tracking-[0.3em] uppercase opacity-30">
          {text}
       </p>
    </div>
  );
}
