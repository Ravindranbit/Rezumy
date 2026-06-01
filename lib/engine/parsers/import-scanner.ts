// ============================================================
// Import Scanner — Scans source files for import statements
// Cross-references against the dep-skill map to verify
// that technologies are actually used in code, not just listed.
// ============================================================

import { DEP_TO_SKILL, AUTH_KEYWORDS, API_KEYWORDS } from "../dep-skill-map";
import { fetchFileContent, fetchRepoTree } from "../github-fetcher";
import type { ParserResult } from "@/lib/types/repository-profile";

/**
 * File extensions to scan for imports, grouped by language.
 */
const SCANNABLE_EXTENSIONS: Record<string, string[]> = {
  javascript: [".js", ".jsx", ".mjs", ".cjs"],
  typescript: [".ts", ".tsx"],
  python: [".py"],
  java: [".java"],
  go: [".go"],
  rust: [".rs"],
};

const ALL_EXTENSIONS = Object.values(SCANNABLE_EXTENSIONS).flat();

/**
 * Maximum number of source files to scan per repo (to avoid rate limits).
 */
const MAX_FILES_TO_SCAN = 20;

/**
 * Extract import/require statements from a source file and map to skills.
 */
function extractImportsFromSource(content: string, extension: string): string[] {
  const imports = new Set<string>();

  if ([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"].includes(extension)) {
    // ES6 imports: import X from "module"
    const esImports = content.match(/(?:import|export)\s+.*?from\s+['""]([^'""]+)['"]/g) || [];
    for (const imp of esImports) {
      const match = imp.match(/from\s+['""]([^'""]+)['"]/);
      if (match) {
        const mod = match[1].replace(/^@/, "").split("/").slice(0, 2).join("/");
        imports.add(mod.startsWith("@") ? mod : mod.split("/")[0]);
      }
    }

    // CommonJS requires: require("module")
    const cjsImports = content.match(/require\s*\(\s*['""]([^'""]+)['"]\s*\)/g) || [];
    for (const imp of cjsImports) {
      const match = imp.match(/['""]([^'""]+)['"]/);
      if (match && !match[1].startsWith(".") && !match[1].startsWith("/")) {
        imports.add(match[1].split("/")[0]);
      }
    }
  }

  if (extension === ".py") {
    // Python imports: import X / from X import Y
    const pyImports = content.match(/(?:^|\n)\s*(?:import|from)\s+([a-zA-Z0-9_]+)/g) || [];
    for (const imp of pyImports) {
      const match = imp.match(/(?:import|from)\s+([a-zA-Z0-9_]+)/);
      if (match) imports.add(match[1].toLowerCase());
    }
  }

  if (extension === ".java") {
    // Java imports: import com.example.Package;
    const javaImports = content.match(/import\s+(?:static\s+)?([a-zA-Z0-9_.]+);/g) || [];
    for (const imp of javaImports) {
      const match = imp.match(/import\s+(?:static\s+)?([a-zA-Z0-9_.]+)/);
      if (match) imports.add(match[1].split(".").slice(0, 3).join("."));
    }
  }

  if (extension === ".go") {
    // Go imports: "github.com/user/package"
    const goImports = content.match(/['""]([a-zA-Z0-9./_-]+)['"]/g) || [];
    for (const imp of goImports) {
      const mod = imp.replace(/['"]/g, "");
      if (mod.includes("/")) imports.add(mod);
    }
  }

  return Array.from(imports);
}

/**
 * Scan source files in a repository for import statements.
 * Returns detected skills and signals for auth/API presence.
 */
export async function scanImports(
  token: string,
  owner: string,
  repo: string
): Promise<ParserResult & { hasAuth: boolean; hasApi: boolean }> {
  const skills = new Set<string>();
  const rawDeps: string[] = [];
  let hasAuth = false;
  let hasApi = false;

  // 1. Get the file tree
  const tree = await fetchRepoTree(token, owner, repo);
  if (tree.length === 0) {
    return { skills: [], rawDeps: [], source: "import-scan", hasAuth: false, hasApi: false };
  }

  // 2. Filter to scannable source files, skip node_modules/vendor/etc.
  const sourceFiles = tree
    .filter((item) => {
      if (item.type !== "blob") return false;
      const path = item.path.toLowerCase();
      // Skip vendored/generated paths
      if (
        path.includes("node_modules/") ||
        path.includes("vendor/") ||
        path.includes(".next/") ||
        path.includes("dist/") ||
        path.includes("build/") ||
        path.includes(".git/") ||
        path.includes("__pycache__/")
      ) {
        return false;
      }
      return ALL_EXTENSIONS.some((ext) => path.endsWith(ext));
    })
    // Prefer "important" files: routes, controllers, services, main files
    .sort((a, b) => {
      const importantPatterns = ["main", "app", "index", "server", "route", "controller", "service", "api"];
      const aScore = importantPatterns.some((p) => a.path.toLowerCase().includes(p)) ? 0 : 1;
      const bScore = importantPatterns.some((p) => b.path.toLowerCase().includes(p)) ? 0 : 1;
      return aScore - bScore;
    })
    .slice(0, MAX_FILES_TO_SCAN);

  // 3. Fetch and parse each file (in batches of 5 to respect rate limits)
  for (let i = 0; i < sourceFiles.length; i += 5) {
    const batch = sourceFiles.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (file) => {
        const content = await fetchFileContent(token, owner, repo, file.path);
        if (!content) return [];
        const ext = "." + file.path.split(".").pop()!;
        return extractImportsFromSource(content, ext);
      })
    );

    for (const fileImports of results) {
      for (const imp of fileImports) {
        rawDeps.push(imp);
        // Map to skill
        const skill = DEP_TO_SKILL[imp] || DEP_TO_SKILL[imp.replace(/_/g, "-")];
        if (skill) skills.add(skill);

        // Check auth/API keywords
        const impLower = imp.toLowerCase();
        if (AUTH_KEYWORDS.some((k) => impLower.includes(k))) hasAuth = true;
        if (API_KEYWORDS.some((k) => impLower.includes(k))) hasApi = true;
      }
    }

    // Rate-limit delay between batches
    if (i + 5 < sourceFiles.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return {
    skills: Array.from(skills),
    rawDeps: [...new Set(rawDeps)],
    source: "import-scan",
    hasAuth,
    hasApi,
  };
}
