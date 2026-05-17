"use client";

import { ResumePreviewData } from "@/types";

// ATS-friendly resume preview component styled like a real A4 page
export default function ResumePreview({ data }: { data: ResumePreviewData }) {
  const { name, email, phone, location, summary, education, experience, skills, projects } = data;

  const contactParts = [email, phone, location].filter(Boolean);

  return (
    <div className="bg-white border border-ordr overflow-hidden selection:bg-ordr-accent selection:text-white">
      {/* A4-like preview area */}
      <div className="p-12 sm:p-16 text-[10.5px] leading-relaxed text-ordr-text" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-medium tracking-tight mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
            {name || "Your Name"}
          </h1>
          {contactParts.length > 0 && (
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase opacity-60">
              {contactParts.join("  /  ")}
            </p>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <Section title="Strategic Summary">
            <p className="whitespace-pre-wrap leading-relaxed opacity-80">{summary}</p>
          </Section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Section title="Professional Experience">
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold tracking-tight text-[11px]">{exp.company}</span>
                    <span className="text-[9px] font-bold tracking-widest uppercase opacity-40">
                      {exp.startDate} — {exp.endDate || "Present"}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium italic opacity-60 mb-2">{exp.role}</div>
                  {exp.description && (
                    <p className="opacity-80 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Section title="Academic Foundation">
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold tracking-tight text-[11px]">{edu.institution}</span>
                    <span className="text-[9px] font-bold tracking-widest uppercase opacity-40">
                      {edu.startDate} — {edu.endDate || "Present"}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium italic opacity-60">{edu.degree}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Section title="Core Competencies">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                   <div className="w-1 h-1 bg-ordr-accent rounded-full opacity-40" />
                   <span className="font-bold tracking-tight opacity-80">{s.name}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Selected Projects">
            <div className="space-y-6">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold tracking-tight text-[11px]">{proj.title}</span>
                    {proj.techStack && (
                      <span className="text-[9px] font-bold tracking-widest uppercase opacity-40 italic">
                        {proj.techStack}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="opacity-80 whitespace-pre-wrap leading-relaxed">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Empty state */}
        {!summary && education.length === 0 && experience.length === 0 && skills.length === 0 && projects.length === 0 && (
          <div className="text-center py-24 opacity-20">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase">Archive Entry Empty</p>
            <p className="mt-2 italic font-serif text-sm">Start documenting your narrative to see the preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40 whitespace-nowrap">
          {title}
        </h2>
        <div className="h-px w-full bg-ordr opacity-10" />
      </div>
      <div className="pl-0">{children}</div>
    </div>
  );
}
