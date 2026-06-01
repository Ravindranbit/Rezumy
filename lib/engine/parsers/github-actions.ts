// ============================================================
// Parser: .github/workflows/*.yml → skills (CI/CD detection)
// ============================================================

import type { ParserResult } from "@/lib/types/repository-profile";

export function parseGithubActions(content: string): ParserResult {
  const skills = new Set<string>();
  const rawDeps: string[] = [];

  skills.add("GitHub Actions");
  skills.add("CI/CD");

  const lower = content.toLowerCase();

  // Detect common actions and tools
  const actionMap: Record<string, string> = {
    "actions/setup-node": "Node.js",
    "actions/setup-python": "Python",
    "actions/setup-java": "Java",
    "actions/setup-go": "Go",
    docker: "Docker",
    aws: "AWS",
    azure: "Azure",
    gcp: "Google Cloud",
    "google-cloud": "Google Cloud",
    vercel: "Vercel",
    netlify: "Netlify",
    terraform: "Terraform",
    "hashicorp/setup-terraform": "Terraform",
    helm: "Helm",
    kubectl: "Kubernetes",
    "eks-action": "AWS EKS",
    heroku: "Heroku",
    flyio: "Fly.io",
    railway: "Railway",
    codecov: "Code Coverage",
    sonarqube: "SonarQube",
    "cypress-io": "Cypress",
    playwright: "Playwright",
    eslint: "ESLint",
    prettier: "Prettier",
  };

  for (const [keyword, skill] of Object.entries(actionMap)) {
    if (lower.includes(keyword.toLowerCase())) {
      skills.add(skill);
      rawDeps.push(keyword);
    }
  }

  // Detect deployment targets from "deploy" or "push" steps
  if (lower.includes("docker push") || lower.includes("docker build")) {
    skills.add("Docker");
    skills.add("Container Registry");
  }
  if (lower.includes("s3") || lower.includes("ecr") || lower.includes("ecs")) {
    skills.add("AWS");
  }

  return {
    skills: Array.from(skills),
    rawDeps,
    source: ".github/workflows",
  };
}
