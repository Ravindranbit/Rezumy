// ============================================================
// README Intelligence Parser
//
// Extracts structured sections from README.md files.
// Instead of passing raw text to the LLM, we parse headings
// and classify content into features, architecture, APIs,
// deployment, tech stack, and installation sections.
// ============================================================

import type { ReadmeSections } from "@/lib/types/repository-profile";

/**
 * Section classification keywords.
 * Maps heading text (lowercased) → section category.
 */
const SECTION_CLASSIFIERS: Record<string, keyof Omit<ReadmeSections, "raw_content">> = {
  // Features
  features: "features",
  "what it does": "features",
  "key features": "features",
  highlights: "features",
  capabilities: "features",
  overview: "features",
  about: "features",

  // Architecture
  architecture: "architecture",
  design: "architecture",
  "system design": "architecture",
  "how it works": "architecture",
  "project structure": "architecture",
  structure: "architecture",
  "folder structure": "architecture",
  "directory structure": "architecture",

  // APIs
  api: "apis",
  apis: "apis",
  endpoints: "apis",
  routes: "apis",
  "api reference": "apis",
  "api documentation": "apis",
  "rest api": "apis",

  // Deployment
  deploy: "deployment",
  deployment: "deployment",
  hosting: "deployment",
  infrastructure: "deployment",
  "production setup": "deployment",
  "docker setup": "deployment",
  "cloud deployment": "deployment",

  // Tech Stack
  "tech stack": "tech_stack",
  "built with": "tech_stack",
  technologies: "tech_stack",
  "technology stack": "tech_stack",
  tools: "tech_stack",
  "tools used": "tech_stack",
  stack: "tech_stack",
  dependencies: "tech_stack",

  // Installation
  install: "installation",
  installation: "installation",
  setup: "installation",
  "getting started": "installation",
  "quick start": "installation",
  quickstart: "installation",
  prerequisites: "installation",
  "local development": "installation",
  "development setup": "installation",
  usage: "installation",
};

/**
 * Parse a heading line and return its level (1–6) and text.
 */
function parseHeading(line: string): { level: number; text: string } | null {
  const match = line.match(/^(#{1,6})\s+(.+)$/);
  if (!match) return null;
  return {
    level: match[1].length,
    text: match[2].trim(),
  };
}

/**
 * Classify a heading into a section category.
 */
function classifyHeading(text: string): keyof Omit<ReadmeSections, "raw_content"> | null {
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, "").trim();

  // Direct match
  if (SECTION_CLASSIFIERS[lower]) {
    return SECTION_CLASSIFIERS[lower];
  }

  // Partial match — check if any classifier keyword is contained in heading
  for (const [keyword, category] of Object.entries(SECTION_CLASSIFIERS)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }

  return null;
}

/**
 * Extract bullet points or meaningful lines from a content block.
 * Filters out empty lines, images, badges, and noise.
 */
function extractMeaningfulLines(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith("![")) return false; // Images
      if (line.startsWith("[![")) return false; // Badges
      if (line.startsWith("---")) return false; // Dividers
      if (line.startsWith("```")) return false; // Code fences
      if (line.match(/^\|.*\|$/)) return false; // Table rows (keep for now, might be useful)
      return true;
    })
    .map((line) => {
      // Clean up list markers
      return line.replace(/^[-*+]\s+/, "").replace(/^\d+\.\s+/, "").trim();
    })
    .filter((line) => line.length > 3); // Filter very short lines
}

/**
 * Parse a README markdown string into structured sections.
 */
export function parseReadme(markdown: string): ReadmeSections {
  const sections: ReadmeSections = {
    features: [],
    architecture: [],
    apis: [],
    deployment: [],
    tech_stack: [],
    installation: [],
    raw_content: markdown,
  };

  if (!markdown || markdown.trim().length === 0) {
    return sections;
  }

  const lines = markdown.split("\n");

  let currentCategory: keyof Omit<ReadmeSections, "raw_content"> | null = null;
  let currentContent: string[] = [];
  let currentHeadingLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const heading = parseHeading(line);

    if (heading) {
      // Flush previous section
      if (currentCategory && currentContent.length > 0) {
        const meaningful = extractMeaningfulLines(currentContent.join("\n"));
        sections[currentCategory].push(...meaningful);
      }

      // Classify new heading
      currentCategory = classifyHeading(heading.text);
      currentHeadingLevel = heading.level;
      currentContent = [];
    } else if (currentCategory) {
      currentContent.push(line);
    }
  }

  // Flush last section
  if (currentCategory && currentContent.length > 0) {
    const meaningful = extractMeaningfulLines(currentContent.join("\n"));
    sections[currentCategory].push(...meaningful);
  }

  // Deduplicate entries within each section
  for (const key of Object.keys(sections) as Array<keyof ReadmeSections>) {
    if (key === "raw_content") continue;
    sections[key] = [...new Set(sections[key] as string[])] as any;
  }

  return sections;
}

/**
 * Extract tech stack mentions from README (low-trust, for verification cross-reference).
 * This is a backward-compatible version of the original extractReadmeSkills.
 */
export function extractReadmeSkills(
  markdown: string,
  depToSkill: Record<string, string>
): string[] {
  const skills = new Set<string>();
  const lower = markdown.toLowerCase();

  // Focus on tech-stack related sections
  const techSectionMatch = lower.match(
    /(?:built with|tech stack|technologies?|tools?|dependencies)[\s\S]{0,800}/i
  );
  const target = techSectionMatch ? techSectionMatch[0] : lower.substring(0, 1500);

  for (const [keyword, skill] of Object.entries(depToSkill)) {
    if (target.includes(keyword.toLowerCase())) {
      skills.add(skill);
    }
  }

  return Array.from(skills);
}
