// ============================================================
// Parser: go.mod → skills + raw dependencies
// ============================================================

import type { ParserResult } from "@/lib/types/repository-profile";

export function parseGoMod(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  // Extract module paths from require() block and standalone require lines
  const requireMatches = content.match(/(?:require\s*\([\s\S]*?\)|require\s+\S+)/g) || [];
  const allContent = requireMatches.join("\n") + "\n" + content;

  const lines = allContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Match Go module paths like "github.com/gin-gonic/gin v1.9.0"
    const match = trimmed.match(/^([a-zA-Z0-9./_-]+)\s+v/);
    if (match) {
      rawDeps.push(match[1]);
    }
  }

  // Map known Go modules to skills
  const depStr = rawDeps.join("\n").toLowerCase();

  if (depStr.includes("gin-gonic/gin")) skills.add("Gin");
  if (depStr.includes("labstack/echo")) skills.add("Echo");
  if (depStr.includes("gofiber/fiber")) skills.add("Fiber");
  if (depStr.includes("gorm.io/gorm")) skills.add("GORM");
  if (depStr.includes("google/wire")) skills.add("Wire (DI)");
  if (depStr.includes("gorilla/mux")) skills.add("Gorilla Mux");
  if (depStr.includes("go-chi/chi")) skills.add("Chi Router");
  if (depStr.includes("grpc")) skills.add("gRPC");
  if (depStr.includes("nats")) skills.add("NATS");
  if (depStr.includes("redis")) skills.add("Redis");
  if (depStr.includes("mongo-driver")) skills.add("MongoDB");
  if (depStr.includes("pgx") || depStr.includes("pq")) skills.add("PostgreSQL");
  if (depStr.includes("cobra")) skills.add("Cobra (CLI)");
  if (depStr.includes("viper")) skills.add("Viper (Config)");
  if (depStr.includes("testify")) skills.add("Testify");
  if (depStr.includes("aws-sdk")) skills.add("AWS SDK");

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "go.mod",
  };
}
