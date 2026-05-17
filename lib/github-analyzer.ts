// ============================================================
// Deep GitHub Repository Analyzer
// Fetches repo file contents and extracts meaningful tech data
// for resume generation — no guessing, actual code analysis.
// ============================================================

interface RepoAnalysis {
  skills: string[];
  projectType: string;
  techStack: string;
  enhancedDescription: string;
}

interface FileContent {
  content: string;
  encoding: string;
}

// ─── Config Files → Framework Detection ─────────────────────

// Maps dependency names (from package.json, requirements.txt, etc.)
// to human-readable skill labels
const DEP_TO_SKILL: Record<string, string> = {
  // JS/TS Frameworks & Libraries
  react: "React",
  "react-dom": "React",
  "react-native": "React Native",
  next: "Next.js",
  nuxt: "Nuxt.js",
  vue: "Vue.js",
  "@vue/core": "Vue.js",
  svelte: "Svelte",
  "@sveltejs/kit": "SvelteKit",
  angular: "Angular",
  "@angular/core": "Angular",
  gatsby: "Gatsby",
  remix: "Remix",
  astro: "Astro",
  express: "Express.js",
  fastify: "Fastify",
  koa: "Koa.js",
  hapi: "Hapi.js",
  nestjs: "NestJS",
  "@nestjs/core": "NestJS",
  socket: "Socket.io",
  "socket.io": "Socket.io",
  graphql: "GraphQL",
  "apollo-server": "Apollo GraphQL",
  "@apollo/server": "Apollo GraphQL",
  trpc: "tRPC",
  "@trpc/server": "tRPC",
  prisma: "Prisma",
  "@prisma/client": "Prisma",
  mongoose: "Mongoose",
  sequelize: "Sequelize",
  typeorm: "TypeORM",
  drizzle: "Drizzle ORM",
  redis: "Redis",
  ioredis: "Redis",
  "pg": "PostgreSQL",
  mysql2: "MySQL",
  sqlite3: "SQLite",
  "@supabase/supabase-js": "Supabase",
  firebase: "Firebase",
  "@firebase/app": "Firebase",
  tailwindcss: "Tailwind CSS",
  "styled-components": "Styled Components",
  "@emotion/react": "Emotion CSS",
  "framer-motion": "Framer Motion",
  "three": "Three.js",
  axios: "Axios",
  "react-query": "React Query",
  "@tanstack/react-query": "React Query",
  zustand: "Zustand",
  redux: "Redux",
  "@reduxjs/toolkit": "Redux Toolkit",
  mobx: "MobX",
  jest: "Jest",
  vitest: "Vitest",
  playwright: "Playwright",
  cypress: "Cypress",
  storybook: "Storybook",
  webpack: "Webpack",
  vite: "Vite",
  esbuild: "esbuild",
  // Python
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  sqlalchemy: "SQLAlchemy",
  celery: "Celery",
  pandas: "Pandas",
  numpy: "NumPy",
  sklearn: "Scikit-learn",
  scikit_learn: "Scikit-learn",
  "scikit-learn": "Scikit-learn",
  tensorflow: "TensorFlow",
  torch: "PyTorch",
  pytorch: "PyTorch",
  keras: "Keras",
  transformers: "Hugging Face Transformers",
  langchain: "LangChain",
  openai: "OpenAI API",
  boto3: "AWS SDK",
  pydantic: "Pydantic",
  alembic: "Alembic",
  pytest: "Pytest",
  uvicorn: "Uvicorn",
  gunicorn: "Gunicorn",
  // Java / Kotlin
  "spring-boot": "Spring Boot",
  "spring-security": "Spring Security",
  "spring-data": "Spring Data",
  "spring-cloud": "Spring Cloud",
  "spring-web": "Spring MVC",
  hibernate: "Hibernate",
  // Go
  gin: "Gin",
  echo: "Echo",
  fiber: "Fiber",
  gorm: "GORM",
  // Infra / DevOps
  docker: "Docker",
  kubernetes: "Kubernetes",
  terraform: "Terraform",
  ansible: "Ansible",
  github_actions: "GitHub Actions",
};

// Project type classification based on keywords
const PROJECT_TYPE_RULES: Array<{ keywords: string[]; type: string }> = [
  { keywords: ["react", "vue", "angular", "svelte", "nextjs", "next", "nuxt", "gatsby", "remix", "astro", "frontend"], type: "Frontend Web App" },
  { keywords: ["express", "fastapi", "flask", "django", "nestjs", "fastify", "koa", "hapi", "rest", "graphql", "api"], type: "Backend / API" },
  { keywords: ["react", "express"], type: "Full-Stack Web App" },
  { keywords: ["next", "prisma"], type: "Full-Stack Web App" },
  { keywords: ["django", "postgresql"], type: "Full-Stack Web App" },
  { keywords: ["tensorflow", "pytorch", "sklearn", "scikit", "pandas", "numpy", "jupyter", "machine-learning", "deep-learning", "ml", "ai"], type: "Machine Learning / AI" },
  { keywords: ["langchain", "openai", "llm", "gpt", "huggingface", "transformers"], type: "AI / LLM Application" },
  { keywords: ["react-native", "flutter", "expo", "android", "ios", "mobile"], type: "Mobile App" },
  { keywords: ["docker", "kubernetes", "terraform", "ansible", "ci", "cd", "devops", "github-actions", "jenkins"], type: "DevOps / Infrastructure" },
  { keywords: ["cli", "command-line", "terminal", "shell", "bash", "script"], type: "CLI Tool" },
  { keywords: ["chrome-extension", "browser-extension", "firefox"], type: "Browser Extension" },
  { keywords: ["discord", "slack", "bot", "telegram"], type: "Bot / Automation" },
  { keywords: ["blockchain", "solidity", "web3", "ethereum", "smart-contract", "nft", "defi"], type: "Blockchain / Web3" },
  { keywords: ["game", "unity", "pygame", "phaser", "godot"], type: "Game" },
  { keywords: ["data", "analytics", "visualization", "dashboard", "notebook"], type: "Data Analysis / Visualization" },
];

// ─── GitHub Raw Content Fetcher ───────────────────────────

async function fetchFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // GitHub returns an array when `path` is a directory — bail out
    if (Array.isArray(data)) return null;
    if (!data || !data.content || data.type !== "file") return null;
    if (data.encoding === "base64") {
      return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchRepoLanguages(
  token: string,
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

// ─── File Parsers ────────────────────────────────────────

function parsePackageJson(content: string): string[] {
  try {
    const pkg = JSON.parse(content);
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };

    const skills = new Set<string>();
    for (const dep of Object.keys(allDeps)) {
      const cleanDep = dep.replace(/^@[^/]+\//, ""); // strip scope e.g. @nestjs/core → nestjs
      const skill = DEP_TO_SKILL[dep] || DEP_TO_SKILL[cleanDep];
      if (skill) skills.add(skill);
    }
    return Array.from(skills);
  } catch {
    return [];
  }
}

function parsePythonRequirements(content: string): string[] {
  const skills = new Set<string>();
  const lines = content.split("\n");
  for (const line of lines) {
    const pkg = line.split(/[>=<!;]/)[0].trim().toLowerCase().replace(/-/g, "_");
    const skill = DEP_TO_SKILL[pkg] || DEP_TO_SKILL[pkg.replace(/_/g, "-")];
    if (skill) skills.add(skill);
  }
  return Array.from(skills);
}

function parsePipfile(content: string): string[] {
  // Pipfile uses TOML-ish format — just extract package names
  const skills = new Set<string>();
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*=/);
    if (match) {
      const pkg = match[1].toLowerCase().replace(/-/g, "_");
      const skill = DEP_TO_SKILL[pkg] || DEP_TO_SKILL[pkg.replace(/_/g, "-")];
      if (skill) skills.add(skill);
    }
  }
  return Array.from(skills);
}

function parsePomXml(content: string): string[] {
  const skills = new Set<string>();
  const artifactIds = content.match(/<artifactId>([^<]+)<\/artifactId>/g) || [];
  for (const tag of artifactIds) {
    const id = tag.replace(/<\/?artifactId>/g, "").toLowerCase();
    if (id.includes("spring-boot")) skills.add("Spring Boot");
    if (id.includes("spring-security")) skills.add("Spring Security");
    if (id.includes("spring-data")) skills.add("Spring Data");
    if (id.includes("hibernate")) skills.add("Hibernate");
    if (id.includes("postgresql")) skills.add("PostgreSQL");
    if (id.includes("mysql")) skills.add("MySQL");
    if (id.includes("junit")) skills.add("JUnit");
    if (id.includes("jackson")) skills.add("Jackson");
    if (id.includes("lombok")) skills.add("Lombok");
  }
  return Array.from(skills);
}

function parseCargoToml(content: string): string[] {
  const skills = new Set<string>();
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*=/);
    if (match) {
      const pkg = match[1].toLowerCase();
      if (pkg === "actix-web" || pkg === "actix_web") skills.add("Actix Web");
      if (pkg === "tokio") skills.add("Tokio (Async)");
      if (pkg === "serde") skills.add("Serde");
      if (pkg === "diesel") skills.add("Diesel ORM");
      if (pkg === "sqlx") skills.add("SQLx");
      if (pkg === "axum") skills.add("Axum");
    }
  }
  return Array.from(skills);
}

function parsePubspecYaml(content: string): string[] {
  const skills = new Set<string>();
  if (content.includes("flutter")) skills.add("Flutter");
  if (content.includes("firebase")) skills.add("Firebase");
  if (content.includes("riverpod") || content.includes("provider")) skills.add("State Management");
  if (content.includes("dio")) skills.add("Dio (HTTP)");
  if (content.includes("hive") || content.includes("shared_preferences")) skills.add("Local Storage");
  if (content.includes("bloc")) skills.add("BLoC Pattern");
  return Array.from(skills);
}

function parseGoMod(content: string): string[] {
  const skills = new Set<string>();
  if (content.includes("gin-gonic/gin")) skills.add("Gin");
  if (content.includes("labstack/echo")) skills.add("Echo");
  if (content.includes("gofiber/fiber")) skills.add("Fiber");
  if (content.includes("gorm.io/gorm")) skills.add("GORM");
  if (content.includes("google/wire")) skills.add("Wire (DI)");
  return Array.from(skills);
}

function parseDockerCompose(content: string): string[] {
  const skills = new Set<string>();
  if (content.includes("postgres")) skills.add("PostgreSQL");
  if (content.includes("mysql")) skills.add("MySQL");
  if (content.includes("mongo")) skills.add("MongoDB");
  if (content.includes("redis")) skills.add("Redis");
  if (content.includes("nginx")) skills.add("Nginx");
  if (content.includes("rabbitmq")) skills.add("RabbitMQ");
  if (content.includes("kafka")) skills.add("Apache Kafka");
  if (content.includes("elasticsearch")) skills.add("Elasticsearch");
  skills.add("Docker");
  return Array.from(skills);
}

function parseGithubActions(content: string): string[] {
  const skills = new Set<string>();
  skills.add("GitHub Actions");
  if (content.includes("docker")) skills.add("Docker");
  if (content.includes("aws")) skills.add("AWS");
  if (content.includes("azure")) skills.add("Azure");
  if (content.includes("gcp") || content.includes("google-cloud")) skills.add("Google Cloud");
  if (content.includes("vercel")) skills.add("Vercel");
  if (content.includes("terraform")) skills.add("Terraform");
  return Array.from(skills);
}

function extractReadmeSkills(content: string): string[] {
  const skills = new Set<string>();
  const lower = content.toLowerCase();
  // Look for "Built with", "Tech Stack", "Technologies" sections
  const techSectionMatch = lower.match(/(?:built with|tech stack|technologies?|tools?)([\s\S]{0,500})/i);
  const target = techSectionMatch ? techSectionMatch[1] : lower.substring(0, 1000);

  for (const [keyword, skill] of Object.entries(DEP_TO_SKILL)) {
    if (target.includes(keyword.toLowerCase())) {
      skills.add(skill);
    }
  }
  return Array.from(skills);
}

// ─── Project Type Classifier ──────────────────────────────

function classifyProjectType(
  allSkills: string[],
  topics: string[],
  description: string,
  repoName: string
): string {
  const lower = [
    ...allSkills.map(s => s.toLowerCase()),
    ...topics.map(t => t.toLowerCase()),
    description.toLowerCase(),
    repoName.toLowerCase(),
  ].join(" ");

  // Score each project type
  const scores: Record<string, number> = {};
  for (const rule of PROJECT_TYPE_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > 0) {
      scores[rule.type] = (scores[rule.type] || 0) + score;
    }
  }

  // Special case: if both frontend and backend signals, upgrade to Full-Stack
  const hasFrontend = (scores["Frontend Web App"] || 0) > 0;
  const hasBackend = (scores["Backend / API"] || 0) > 0;
  if (hasFrontend && hasBackend) return "Full-Stack Web App";

  // Return highest-scored type
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "Software Project";
}

// ─── Main Analyzer ────────────────────────────────────────

export async function analyzeRepository(
  token: string,
  fullName: string, // e.g. "username/repo-name"
  repoData: {
    language: string;
    topics: string[];
    description: string;
    name: string;
  }
): Promise<RepoAnalysis> {
  const [owner, repo] = fullName.split("/");
  const skills = new Set<string>();

  // 1. Languages from GitHub Languages API (more accurate than single language)
  const languages = await fetchRepoLanguages(token, owner, repo);
  for (const lang of Object.keys(languages)) {
    skills.add(lang);
    // Map to frameworks/skills
    if (lang === "TypeScript" || lang === "JavaScript") {
      // Will be enriched from package.json
    }
    if (lang === "Python") skills.add("Python");
    if (lang === "Java") skills.add("Java");
    if (lang === "Kotlin") skills.add("Kotlin");
    if (lang === "Dart") skills.add("Dart");
    if (lang === "Go") skills.add("Go");
    if (lang === "Rust") skills.add("Rust");
    if (lang === "C#") { skills.add("C#"); skills.add(".NET"); }
    if (lang === "Ruby") skills.add("Ruby");
    if (lang === "Swift") { skills.add("Swift"); skills.add("iOS"); }
    if (lang === "PHP") skills.add("PHP");
    if (lang === "Shell" || lang === "Dockerfile") skills.add("DevOps");
  }

  // 2. Parse dependency files (most accurate source)
  const [
    packageJson,
    requirements,
    pipfile,
    pomXml,
    cargoToml,
    pubspec,
    goMod,
    dockerCompose,
    dockerfile,
  ] = await Promise.all([
    fetchFileContent(token, owner, repo, "package.json"),
    fetchFileContent(token, owner, repo, "requirements.txt"),
    fetchFileContent(token, owner, repo, "Pipfile"),
    fetchFileContent(token, owner, repo, "pom.xml"),
    fetchFileContent(token, owner, repo, "Cargo.toml"),
    fetchFileContent(token, owner, repo, "pubspec.yaml"),
    fetchFileContent(token, owner, repo, "go.mod"),
    fetchFileContent(token, owner, repo, "docker-compose.yml").then(
      r => r || fetchFileContent(token, owner, repo, "docker-compose.yaml")
    ),
    fetchFileContent(token, owner, repo, "Dockerfile"),
  ]);

  if (packageJson) parsePackageJson(packageJson).forEach(s => skills.add(s));
  if (requirements) parsePythonRequirements(requirements).forEach(s => skills.add(s));
  if (pipfile) parsePipfile(pipfile).forEach(s => skills.add(s));
  if (pomXml) parsePomXml(pomXml).forEach(s => skills.add(s));
  if (cargoToml) parseCargoToml(cargoToml).forEach(s => skills.add(s));
  if (pubspec) parsePubspecYaml(pubspec).forEach(s => skills.add(s));
  if (goMod) parseGoMod(goMod).forEach(s => skills.add(s));
  if (dockerCompose) parseDockerCompose(dockerCompose).forEach(s => skills.add(s));
  if (dockerfile) skills.add("Docker");

  // 3. GitHub Actions workflow
  const workflow = await fetchFileContent(token, owner, repo, ".github/workflows/main.yml")
    .then(r => r || fetchFileContent(token, owner, repo, ".github/workflows/deploy.yml"))
    .then(r => r || fetchFileContent(token, owner, repo, ".github/workflows/ci.yml"));
  if (workflow) parseGithubActions(workflow).forEach(s => skills.add(s));

  // 4. README for tech stack mentions
  const readme = await fetchFileContent(token, owner, repo, "README.md")
    .then(r => r || fetchFileContent(token, owner, repo, "readme.md"));
  if (readme) extractReadmeSkills(readme).forEach(s => skills.add(s));

  // 5. Deduplicate + add topic-based skills from existing logic
  for (const topic of repoData.topics) {
    const t = topic.toLowerCase();
    // Map common topics
    const topicToSkill: Record<string, string> = {
      react: "React", nextjs: "Next.js", "next-js": "Next.js",
      vue: "Vue.js", angular: "Angular", svelte: "Svelte",
      nodejs: "Node.js", express: "Express.js",
      django: "Django", flask: "Flask", fastapi: "FastAPI",
      docker: "Docker", kubernetes: "Kubernetes",
      aws: "AWS", firebase: "Firebase", mongodb: "MongoDB",
      postgresql: "PostgreSQL", mysql: "MySQL", redis: "Redis",
      prisma: "Prisma", tailwindcss: "Tailwind CSS",
      "machine-learning": "Machine Learning", tensorflow: "TensorFlow",
      pytorch: "PyTorch", flutter: "Flutter",
      typescript: "TypeScript", javascript: "JavaScript",
      python: "Python", golang: "Go", rust: "Rust",
      graphql: "GraphQL", "rest-api": "REST APIs",
    };
    const mapped = topicToSkill[t];
    if (mapped) skills.add(mapped);
  }

  const skillList = Array.from(skills).filter(s => s.length > 0);

  // 6. Classify project type
  const projectType = classifyProjectType(
    skillList,
    repoData.topics,
    repoData.description,
    repoData.name
  );

  // 7. Build ordered tech stack string (languages first, then frameworks, then infra)
  const techStack = skillList.join(", ");

  // 8. Generate HR-friendly enhanced description
  const enhancedDescription = generateHRDescription({
    name: repoData.name,
    projectType,
    skills: skillList,
    description: repoData.description,
    languages: Object.keys(languages),
  });

  return {
    skills: skillList,
    projectType,
    techStack,
    enhancedDescription,
  };
}

function generateHRDescription(params: {
  name: string;
  projectType: string;
  skills: string[];
  description: string;
  languages: string[];
}): string {
  const { name, projectType, skills, description, languages } = params;
  const title = name.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const bullets: string[] = [];

  // Primary description
  if (description) {
    bullets.push(description);
  } else {
    bullets.push(`${projectType} — ${title}`);
  }

  // Languages used
  if (languages.length > 0) {
    bullets.push(`Written in ${languages.slice(0, 3).join(", ")}`);
  }

  // Framework & key tech
  const frameworks = skills.filter(s =>
    ["React", "Vue.js", "Angular", "Next.js", "Django", "Flask", "FastAPI",
     "Spring Boot", "Express.js", "NestJS", "Flutter", "Svelte", "Nuxt.js"].includes(s)
  );
  if (frameworks.length > 0) {
    bullets.push(`Built with ${frameworks.join(", ")}`);
  }

  // Database
  const databases = skills.filter(s =>
    ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase", "Firebase"].includes(s)
  );
  if (databases.length > 0) {
    bullets.push(`Data persistence with ${databases.join(", ")}`);
  }

  // Infra / DevOps
  const infra = skills.filter(s =>
    ["Docker", "Kubernetes", "GitHub Actions", "AWS", "Azure", "Google Cloud",
     "Terraform", "Vercel", "Nginx"].includes(s)
  );
  if (infra.length > 0) {
    bullets.push(`Deployed / managed with ${infra.join(", ")}`);
  }

  return bullets.join("\n");
}
