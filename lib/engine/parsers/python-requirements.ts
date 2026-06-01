// ============================================================
// Parser: requirements.txt → skills + raw dependencies
// ============================================================

import { DEP_TO_SKILL } from "../dep-skill-map";
import type { ParserResult } from "@/lib/types/repository-profile";

export function parsePythonRequirements(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;

    const pkg = trimmed.split(/[>=<!;]/)[0].trim().toLowerCase().replace(/-/g, "_");
    if (!pkg) continue;
    rawDeps.push(pkg);

    const skill = DEP_TO_SKILL[pkg] || DEP_TO_SKILL[pkg.replace(/_/g, "-")];
    if (skill) skills.add(skill);
  }

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "requirements.txt",
  };
}
