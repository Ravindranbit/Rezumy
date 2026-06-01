// ============================================================
// Parser: pom.xml → skills + raw dependencies
// ============================================================

import type { ParserResult } from "@/lib/types/repository-profile";

export function parsePomXml(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  const artifactIds = content.match(/<artifactId>([^<]+)<\/artifactId>/g) || [];
  for (const tag of artifactIds) {
    const id = tag.replace(/<\/?artifactId>/g, "").toLowerCase();
    rawDeps.push(id);

    if (id.includes("spring-boot")) skills.add("Spring Boot");
    if (id.includes("spring-security")) skills.add("Spring Security");
    if (id.includes("spring-data")) skills.add("Spring Data");
    if (id.includes("spring-cloud")) skills.add("Spring Cloud");
    if (id.includes("spring-web") || id.includes("spring-boot-starter-web")) skills.add("Spring MVC");
    if (id.includes("hibernate")) skills.add("Hibernate");
    if (id.includes("postgresql")) skills.add("PostgreSQL");
    if (id.includes("mysql")) skills.add("MySQL");
    if (id.includes("mongodb") || id.includes("mongo")) skills.add("MongoDB");
    if (id.includes("junit")) skills.add("JUnit");
    if (id.includes("jackson")) skills.add("Jackson");
    if (id.includes("lombok")) skills.add("Lombok");
    if (id.includes("flyway")) skills.add("Flyway");
    if (id.includes("liquibase")) skills.add("Liquibase");
    if (id.includes("swagger") || id.includes("springdoc")) skills.add("Swagger/OpenAPI");
  }

  // Also check groupIds for broader framework detection
  const groupIds = content.match(/<groupId>([^<]+)<\/groupId>/g) || [];
  for (const tag of groupIds) {
    const id = tag.replace(/<\/?groupId>/g, "").toLowerCase();
    if (id.includes("org.springframework")) skills.add("Spring Boot");
    if (id.includes("io.quarkus")) skills.add("Quarkus");
    if (id.includes("io.micronaut")) skills.add("Micronaut");
  }

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "pom.xml",
  };
}
