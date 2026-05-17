import { ResumePreviewData } from "@/types";

// Generate a clean, ATS-friendly HTML resume for PDF conversion
export function generateResumeHTML(data: ResumePreviewData): string {
  const { name, email, phone, location, summary, education, experience, skills, projects } = data;

  const contactParts = [email, phone, location].filter(Boolean).join(" • ");

  const educationHTML = education.length > 0 ? `
    <div class="section">
      <h2>Education</h2>
      <div class="divider"></div>
      ${education.map(e => `
        <div class="entry">
          <div class="entry-header">
            <strong>${e.institution}</strong>
            <span class="date">${e.startDate} — ${e.endDate || "Present"}</span>
          </div>
          <div class="entry-subtitle">${e.degree}</div>
        </div>
      `).join("")}
    </div>
  ` : "";

  const experienceHTML = experience.length > 0 ? `
    <div class="section">
      <h2>Experience</h2>
      <div class="divider"></div>
      ${experience.map(e => `
        <div class="entry">
          <div class="entry-header">
            <strong>${e.company}</strong>
            <span class="date">${e.startDate} — ${e.endDate || "Present"}</span>
          </div>
          <div class="entry-subtitle">${e.role}</div>
          ${e.description ? `<p class="description">${e.description}</p>` : ""}
        </div>
      `).join("")}
    </div>
  ` : "";

  const skillsHTML = skills.length > 0 ? `
    <div class="section">
      <h2>Skills</h2>
      <div class="divider"></div>
      <p class="skills-list">${skills.map(s => s.name).join(" • ")}</p>
    </div>
  ` : "";

  const projectsHTML = projects.length > 0 ? `
    <div class="section">
      <h2>Projects</h2>
      <div class="divider"></div>
      ${projects.map(p => `
        <div class="entry">
          <div class="entry-header">
            <strong>${p.title}</strong>
          </div>
          ${p.description ? `<p class="description">${p.description}</p>` : ""}
          ${p.techStack ? `<p class="tech-stack"><em>Tech: ${p.techStack}</em></p>` : ""}
        </div>
      `).join("")}
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 40px 50px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 22pt;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 4px;
      color: #111;
    }
    .header .contact {
      font-size: 10pt;
      color: #444;
    }
    .section {
      margin-bottom: 16px;
    }
    .section h2 {
      font-size: 12pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #111;
      margin-bottom: 2px;
    }
    .divider {
      border-bottom: 1.5px solid #333;
      margin-bottom: 8px;
    }
    .summary {
      font-size: 10.5pt;
      color: #333;
      margin-bottom: 4px;
    }
    .entry {
      margin-bottom: 10px;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .entry-header strong {
      font-size: 11pt;
    }
    .date {
      font-size: 10pt;
      color: #555;
    }
    .entry-subtitle {
      font-style: italic;
      font-size: 10.5pt;
      color: #333;
    }
    .description {
      font-size: 10.5pt;
      color: #333;
      margin-top: 3px;
      white-space: pre-wrap;
    }
    .skills-list {
      font-size: 10.5pt;
      color: #333;
    }
    .tech-stack {
      font-size: 10pt;
      color: #555;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <div class="contact">${contactParts}</div>
  </div>

  ${summary ? `
  <div class="section">
    <h2>Summary</h2>
    <div class="divider"></div>
    <p class="summary">${summary}</p>
  </div>
  ` : ""}

  ${experienceHTML}
  ${educationHTML}
  ${skillsHTML}
  ${projectsHTML}
</body>
</html>`;
}
