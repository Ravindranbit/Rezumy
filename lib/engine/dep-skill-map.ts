// ============================================================
// Shared Dependency → Skill Mapping
// Single source of truth for all parsers and the tech verifier.
// Extracted from the original github-analyzer.ts DEP_TO_SKILL map.
// ============================================================

/**
 * Maps dependency/package names (from package.json, requirements.txt, etc.)
 * to human-readable skill labels used on resumes.
 */
export const DEP_TO_SKILL: Record<string, string> = {
  // ─── JS/TS Frameworks & Libraries ───────────────────────
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
  pg: "PostgreSQL",
  mysql2: "MySQL",
  sqlite3: "SQLite",
  "@supabase/supabase-js": "Supabase",
  firebase: "Firebase",
  "@firebase/app": "Firebase",
  tailwindcss: "Tailwind CSS",
  "styled-components": "Styled Components",
  "@emotion/react": "Emotion CSS",
  "framer-motion": "Framer Motion",
  three: "Three.js",
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

  // ─── Python ─────────────────────────────────────────────
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

  // ─── Java / Kotlin ──────────────────────────────────────
  "spring-boot": "Spring Boot",
  "spring-security": "Spring Security",
  "spring-data": "Spring Data",
  "spring-cloud": "Spring Cloud",
  "spring-web": "Spring MVC",
  hibernate: "Hibernate",

  // ─── Go ─────────────────────────────────────────────────
  gin: "Gin",
  echo: "Echo",
  fiber: "Fiber",
  gorm: "GORM",

  // ─── Infra / DevOps ─────────────────────────────────────
  docker: "Docker",
  kubernetes: "Kubernetes",
  terraform: "Terraform",
  ansible: "Ansible",
  github_actions: "GitHub Actions",
};

/**
 * Skill categories for structured profile building.
 * Used by the tech verifier to classify verified skills.
 */
export const SKILL_CATEGORIES: Record<string, string[]> = {
  frameworks: [
    "React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte", "SvelteKit",
    "Gatsby", "Remix", "Astro", "Express.js", "Fastify", "Koa.js", "Hapi.js",
    "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "Spring MVC",
    "Spring Security", "Spring Data", "Spring Cloud", "Flutter", "React Native",
    "Gin", "Echo", "Fiber", "Actix Web", "Axum",
  ],
  databases: [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Supabase", "Firebase",
    "Elasticsearch", "RabbitMQ", "Apache Kafka",
  ],
  cloud: [
    "AWS", "AWS SDK", "Azure", "Google Cloud", "Vercel",
  ],
  deployment: [
    "Docker", "Kubernetes", "Terraform", "Ansible", "GitHub Actions", "Nginx",
  ],
  testing: [
    "Jest", "Vitest", "Playwright", "Cypress", "Pytest", "JUnit", "Storybook",
  ],
  ml_ai: [
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Hugging Face Transformers",
    "LangChain", "OpenAI API", "Pandas", "NumPy",
  ],
  orm: [
    "Prisma", "Mongoose", "Sequelize", "TypeORM", "Drizzle ORM", "SQLAlchemy",
    "Hibernate", "GORM", "Diesel ORM", "SQLx", "Alembic",
  ],
  auth: [
    "Spring Security",
  ],
};

/**
 * Keywords that indicate authentication is present in a project.
 * Used by import scanner and README parser.
 */
export const AUTH_KEYWORDS = [
  "jwt", "jsonwebtoken", "passport", "auth0", "@auth0",
  "next-auth", "nextauth", "clerk", "@clerk",
  "bcrypt", "bcryptjs", "argon2",
  "oauth", "oauth2", "openid",
  "session", "cookie-session",
  "spring-security",
];

/**
 * Keywords that indicate REST/GraphQL API presence.
 */
export const API_KEYWORDS = [
  "express", "fastify", "koa", "hapi", "nestjs",
  "fastapi", "flask", "django-rest-framework", "djangorestframework",
  "graphql", "apollo-server", "@apollo/server", "trpc", "@trpc/server",
  "swagger", "openapi", "@nestjs/swagger",
  "spring-web", "spring-boot-starter-web",
  "gin", "echo", "fiber", "actix-web", "axum",
];

/**
 * Project type classification rules (from original analyzer).
 */
export const PROJECT_TYPE_RULES: Array<{ keywords: string[]; type: string }> = [
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
