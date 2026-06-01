// ============================================================
// Parser: pubspec.yaml → skills + raw dependencies
// ============================================================

import type { ParserResult } from "@/lib/types/repository-profile";

export function parsePubspecYaml(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  // Extract dependency names from YAML (simple line-based parsing)
  const lines = content.split("\n");
  let inDeps = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track sections
    if (/^(dependencies|dev_dependencies):/.test(trimmed)) {
      inDeps = true;
      continue;
    }
    if (/^\S/.test(line) && !line.startsWith(" ") && !line.startsWith("\t")) {
      inDeps = false;
      continue;
    }

    if (inDeps) {
      const match = trimmed.match(/^([a-zA-Z0-9_]+):/);
      if (match) rawDeps.push(match[1]);
    }
  }

  const lower = content.toLowerCase();

  // Map known Flutter/Dart packages
  if (lower.includes("flutter")) skills.add("Flutter");
  if (lower.includes("firebase")) skills.add("Firebase");
  if (lower.includes("riverpod")) skills.add("Riverpod");
  if (lower.includes("provider")) skills.add("Provider");
  if (lower.includes("bloc")) skills.add("BLoC Pattern");
  if (lower.includes("getx") || lower.includes("get:")) skills.add("GetX");
  if (lower.includes("dio")) skills.add("Dio (HTTP)");
  if (lower.includes("http:")) skills.add("HTTP Client");
  if (lower.includes("hive") || lower.includes("shared_preferences")) skills.add("Local Storage");
  if (lower.includes("sqflite")) skills.add("SQLite");
  if (lower.includes("floor")) skills.add("Floor (ORM)");
  if (lower.includes("go_router")) skills.add("GoRouter");
  if (lower.includes("flutter_test") || lower.includes("integration_test")) skills.add("Flutter Testing");

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "pubspec.yaml",
  };
}
