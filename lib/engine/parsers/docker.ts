// ============================================================
// Parser: Dockerfile + docker-compose.yml → skills
// ============================================================

import type { ParserResult } from "@/lib/types/repository-profile";

/**
 * Parse Dockerfile content for base images and tools.
 */
export function parseDockerfile(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  skills.add("Docker");

  const lower = content.toLowerCase();

  // Extract base images from FROM directives
  const fromMatches = content.match(/^FROM\s+(\S+)/gim) || [];
  for (const fromLine of fromMatches) {
    const image = fromLine.replace(/^FROM\s+/i, "").split(":")[0].toLowerCase();
    rawDeps.push(image);

    if (image.includes("python")) skills.add("Python");
    if (image.includes("node")) skills.add("Node.js");
    if (image.includes("golang") || image.includes("go")) skills.add("Go");
    if (image.includes("rust")) skills.add("Rust");
    if (image.includes("java") || image.includes("openjdk") || image.includes("maven") || image.includes("gradle")) skills.add("Java");
    if (image.includes("ruby")) skills.add("Ruby");
    if (image.includes("nginx")) skills.add("Nginx");
    if (image.includes("alpine")) skills.add("Alpine Linux");
  }

  // Detect tools used in RUN commands
  if (lower.includes("pip install") || lower.includes("pip3 install")) skills.add("Python");
  if (lower.includes("npm install") || lower.includes("yarn") || lower.includes("pnpm")) skills.add("Node.js");
  if (lower.includes("gradle")) skills.add("Gradle");
  if (lower.includes("maven") || lower.includes("mvn")) skills.add("Maven");

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "Dockerfile",
  };
}

/**
 * Parse docker-compose.yml for services and infrastructure.
 */
export function parseDockerCompose(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  skills.add("Docker");
  skills.add("Docker Compose");

  const lower = content.toLowerCase();

  // Detect common services from image names
  const imageMap: Record<string, string> = {
    postgres: "PostgreSQL",
    mysql: "MySQL",
    mariadb: "MariaDB",
    mongo: "MongoDB",
    redis: "Redis",
    nginx: "Nginx",
    rabbitmq: "RabbitMQ",
    kafka: "Apache Kafka",
    zookeeper: "Apache Kafka",
    elasticsearch: "Elasticsearch",
    kibana: "Kibana",
    grafana: "Grafana",
    prometheus: "Prometheus",
    minio: "MinIO (S3)",
    traefik: "Traefik",
    consul: "Consul",
    vault: "HashiCorp Vault",
    mailhog: "MailHog",
    adminer: "Adminer",
    pgadmin: "pgAdmin",
    memcached: "Memcached",
  };

  for (const [keyword, skill] of Object.entries(imageMap)) {
    if (lower.includes(keyword)) {
      skills.add(skill);
      rawDeps.push(keyword);
    }
  }

  return {
    skills: Array.from(skills),
    rawDeps,
    source: "docker-compose.yml",
  };
}
