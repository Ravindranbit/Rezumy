// ============================================================
// Parser: package.json → skills + raw dependencies
// ============================================================

import { DEP_TO_SKILL } from "../dep-skill-map";
import type { ParserResult } from "@/lib/types/repository-profile";

export function parsePackageJson(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  try {
    const pkg = JSON.parse(content);
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };

    for (const dep of Object.keys(allDeps)) {
      rawDeps.push(dep);
      const cleanDep = dep.replace(/^@[^/]+\//, ""); // @nestjs/core → nestjs
      const skill = DEP_TO_SKILL[dep] || DEP_TO_SKILL[cleanDep];
      if (skill) skills.add(skill);
    }
  } catch {
    // Invalid JSON — skip
  }

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "package.json",
  };
}
