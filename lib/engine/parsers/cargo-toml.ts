// ============================================================
// Parser: Cargo.toml → skills + raw dependencies
// ============================================================

import type { ParserResult } from "@/lib/types/repository-profile";

export function parseCargoToml(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  const lines = content.split("\n");
  let inDeps = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track sections
    if (trimmed.startsWith("[")) {
      inDeps = trimmed.includes("dependencies");
      continue;
    }

    if (!inDeps) continue;

    const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=/);
    if (match) {
      const pkg = match[1].toLowerCase();
      rawDeps.push(pkg);

      // Map known Rust crates to skills
      if (pkg === "actix-web" || pkg === "actix_web") skills.add("Actix Web");
      if (pkg === "tokio") skills.add("Tokio (Async)");
      if (pkg === "serde" || pkg === "serde_json") skills.add("Serde");
      if (pkg === "diesel") skills.add("Diesel ORM");
      if (pkg === "sqlx") skills.add("SQLx");
      if (pkg === "axum") skills.add("Axum");
      if (pkg === "rocket") skills.add("Rocket");
      if (pkg === "warp") skills.add("Warp");
      if (pkg === "reqwest") skills.add("Reqwest");
      if (pkg === "clap") skills.add("Clap (CLI)");
      if (pkg === "tonic") skills.add("Tonic (gRPC)");
      if (pkg === "tracing") skills.add("Tracing");
    }
  }

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "Cargo.toml",
  };
}
