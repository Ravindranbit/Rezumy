// ============================================================
// GitHub Constants & Skill Mappings
// ============================================================

/**
 * Language → Skill mapping for automatic skill detection.
 */
export const LANGUAGE_SKILL_MAP: Record<string, string[]> = {
  JavaScript: ["JavaScript", "Node.js"],
  TypeScript: ["TypeScript", "Node.js"],
  Python: ["Python"],
  Java: ["Java"],
  Go: ["Go"],
  Rust: ["Rust"],
  "C++": ["C++"],
  C: ["C"],
  "C#": ["C#", ".NET"],
  Ruby: ["Ruby"],
  PHP: ["PHP"],
  Swift: ["Swift", "iOS"],
  Kotlin: ["Kotlin", "Android"],
  Dart: ["Dart", "Flutter"],
  HTML: ["HTML", "CSS"],
  CSS: ["CSS"],
  Shell: ["Shell", "DevOps"],
  Dockerfile: ["Docker", "DevOps"],
};

/**
 * Topic → Skill enrichment mapping.
 */
export const TOPIC_SKILL_MAP: Record<string, string> = {
  react: "React",
  nextjs: "Next.js",
  "next-js": "Next.js",
  vue: "Vue.js",
  angular: "Angular",
  svelte: "Svelte",
  nodejs: "Node.js",
  "node-js": "Node.js",
  express: "Express.js",
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  "spring-boot": "Spring Boot",
  graphql: "GraphQL",
  rest: "REST APIs",
  "rest-api": "REST APIs",
  docker: "Docker",
  kubernetes: "Kubernetes",
  aws: "AWS",
  firebase: "Firebase",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  redis: "Redis",
  prisma: "Prisma",
  tailwindcss: "Tailwind CSS",
  "tailwind-css": "Tailwind CSS",
  "machine-learning": "Machine Learning",
  ai: "AI",
  "deep-learning": "Deep Learning",
  tensorflow: "TensorFlow",
  pytorch: "PyTorch",
  jest: "Jest",
  testing: "Unit Testing",
  linux: "Linux",
  azure: "Azure",
  gcp: "Google Cloud",
  strapi: "Strapi",
  supabase: "Supabase",
};
