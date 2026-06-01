// ============================================================
// Technology Verification Engine
//
// Cross-references skills from multiple sources and assigns
// confidence levels. Only technologies confirmed by at least
// one config/code file are considered "verified".
//
// README mentions alone are NOT sufficient — this is the
// core anti-hallucination mechanism.
// ============================================================

import { SKILL_CATEGORIES } from "./dep-skill-map";
import type {
  ParserResult,
  VerifiedTechnology,
  ConfidenceLevel,
} from "@/lib/types/repository-profile";

/**
 * Sources ranked by trust level (highest first).
 * Config files and code are trusted. README is supplementary only.
 */
const SOURCE_TRUST: Record<string, number> = {
  "package.json": 10,
  "requirements.txt": 10,
  Pipfile: 10,
  "pom.xml": 10,
  "Cargo.toml": 10,
  "go.mod": 10,
  "pubspec.yaml": 10,
  Dockerfile: 8,
  "docker-compose.yml": 8,
  ".github/workflows": 7,
  "import-scan": 9, // Actual code usage — very high trust
  readme: 2, // Low trust — only confirms, never adds
  topics: 3, // GitHub topics — low trust
};

/**
 * Determines confidence level based on source count and trust score.
 */
function getConfidence(sources: string[]): ConfidenceLevel {
  const maxTrust = Math.max(...sources.map((s) => SOURCE_TRUST[s] || 1));
  const sourceCount = sources.length;

  if (maxTrust >= 9 && sourceCount >= 2) return "high";
  if (maxTrust >= 7) return "high";
  if (maxTrust >= 5 || sourceCount >= 2) return "medium";
  return "low";
}

/**
 * Verify technologies by cross-referencing parser results.
 *
 * Rules:
 * 1. A tech appearing in ANY config/code file (trust >= 7) is auto-verified
 * 2. A tech appearing ONLY in README/topics needs at least 2 such mentions
 * 3. Confidence is based on trust level and source diversity
 */
export function verifyTechnologies(
  parserResults: ParserResult[],
  readmeSkills: string[] = [],
  topicSkills: string[] = []
): VerifiedTechnology[] {
  // Build skill → sources map
  const skillSources = new Map<string, Set<string>>();

  for (const result of parserResults) {
    for (const skill of result.skills) {
      if (!skillSources.has(skill)) {
        skillSources.set(skill, new Set());
      }
      skillSources.get(skill)!.add(result.source);
    }
  }

  // Add README skills (low trust)
  for (const skill of readmeSkills) {
    if (!skillSources.has(skill)) {
      skillSources.set(skill, new Set());
    }
    skillSources.get(skill)!.add("readme");
  }

  // Add topic skills (low trust)
  for (const skill of topicSkills) {
    if (!skillSources.has(skill)) {
      skillSources.set(skill, new Set());
    }
    skillSources.get(skill)!.add("topics");
  }

  // Verify each skill
  const verified: VerifiedTechnology[] = [];

  for (const [skill, sourcesSet] of skillSources) {
    const sources = Array.from(sourcesSet);
    const maxTrust = Math.max(...sources.map((s) => SOURCE_TRUST[s] || 1));

    // Rule: README/topics-only skills need at least 2 mentions
    if (maxTrust <= 3 && sources.length < 2) {
      continue; // Skip — not enough evidence
    }

    verified.push({
      technology: skill,
      confidence: getConfidence(sources),
      sources,
    });
  }

  // Sort: high confidence first, then alphabetical
  verified.sort((a, b) => {
    const confOrder = { high: 0, medium: 1, low: 2 };
    const confDiff = confOrder[a.confidence] - confOrder[b.confidence];
    if (confDiff !== 0) return confDiff;
    return a.technology.localeCompare(b.technology);
  });

  return verified;
}

/**
 * Categorize verified technologies into structured groups.
 * Used to build the RepositoryProfile's frameworks/databases/cloud/etc. arrays.
 */
export function categorizeTechnologies(
  verified: VerifiedTechnology[]
): {
  frameworks: string[];
  databases: string[];
  cloud: string[];
  deployment: string[];
  testing: string[];
  ml_ai: string[];
  orm: string[];
  other: string[];
} {
  const result = {
    frameworks: [] as string[],
    databases: [] as string[],
    cloud: [] as string[],
    deployment: [] as string[],
    testing: [] as string[],
    ml_ai: [] as string[],
    orm: [] as string[],
    other: [] as string[],
  };

  for (const tech of verified) {
    let categorized = false;
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      if (skills.includes(tech.technology)) {
        const key = category as keyof typeof result;
        if (key in result) {
          result[key].push(tech.technology);
          categorized = true;
          break;
        }
      }
    }
    if (!categorized) {
      result.other.push(tech.technology);
    }
  }

  return result;
}

/**
 * Get only the skill names from verified technologies.
 * This is the "allowed list" for LLM prompts — no hallucination possible.
 */
export function getVerifiedSkillNames(
  verified: VerifiedTechnology[],
  minConfidence: ConfidenceLevel = "low"
): string[] {
  const confOrder = { high: 0, medium: 1, low: 2 };
  const threshold = confOrder[minConfidence];

  return verified
    .filter((t) => confOrder[t.confidence] <= threshold)
    .map((t) => t.technology);
}
