// ============================================================
// Parser: Pipfile → skills + raw dependencies
// ============================================================

import { DEP_TO_SKILL } from "../dep-skill-map";
import type { ParserResult } from "@/lib/types/repository-profile";

export function parsePipfile(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*=/);
    if (match) {
      const pkg = match[1].toLowerCase().replace(/-/g, "_");
      rawDeps.push(pkg);
      const skill = DEP_TO_SKILL[pkg] || DEP_TO_SKILL[pkg.replace(/_/g, "-")];
      if (skill) skills.add(skill);
    }
  }

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "Pipfile",
  };
}
