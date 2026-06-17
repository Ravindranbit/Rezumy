// ============================================================
// Job Description Parser (Phase 2.1)
//
// Parses raw job description text into a structured format using
// Groq LLM with JSON output mode. Normalizes skill/technology
// names against the DEP_TO_SKILL map to ensure consistency with
// the tech verification engine.
//
// Purely role-based — no company name extraction.
// ============================================================

import { DEP_TO_SKILL } from "./dep-skill-map";
import type {
  ParsedJobDescription,
  SeniorityLevel,
} from "@/lib/types/repository-profile";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ─── Skill Normalization ────────────────────────────────────

/**
 * Build a reverse lookup from common aliases/variants to canonical names.
 * e.g. "react.js" → "React", "node" → "Node.js", "postgres" → "PostgreSQL"
 */
const NORMALIZATION_MAP: Record<string, string> = {};

// Populate from DEP_TO_SKILL (maps dep names → canonical skill names)
for (const [dep, skill] of Object.entries(DEP_TO_SKILL)) {
  NORMALIZATION_MAP[dep.toLowerCase()] = skill;
}

// Add common aliases the LLM might output that aren't in DEP_TO_SKILL
const EXTRA_ALIASES: Record<string, string> = {
  "react.js": "React",
  "reactjs": "React",
  "react js": "React",
  "node": "Node.js",
  "node.js": "Node.js",
  "nodejs": "Node.js",
  "node js": "Node.js",
  "typescript": "TypeScript",
  "ts": "TypeScript",
  "javascript": "JavaScript",
  "js": "JavaScript",
  "python": "Python",
  "py": "Python",
  "java": "Java",
  "golang": "Go",
  "go": "Go",
  "rust": "Rust",
  "c++": "C++",
  "cpp": "C++",
  "c#": "C#",
  "csharp": "C#",
  "ruby": "Ruby",
  "php": "PHP",
  "kotlin": "Kotlin",
  "swift": "Swift",
  "scala": "Scala",
  "r": "R",
  "sql": "SQL",
  "nosql": "NoSQL",
  "mongo": "MongoDB",
  "mongodb": "MongoDB",
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "mysql": "MySQL",
  "dynamodb": "DynamoDB",
  "cassandra": "Cassandra",
  "elastic search": "Elasticsearch",
  "elasticsearch": "Elasticsearch",
  "aws": "AWS",
  "amazon web services": "AWS",
  "gcp": "Google Cloud",
  "google cloud": "Google Cloud",
  "google cloud platform": "Google Cloud",
  "azure": "Azure",
  "microsoft azure": "Azure",
  "docker": "Docker",
  "k8s": "Kubernetes",
  "kubernetes": "Kubernetes",
  "terraform": "Terraform",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD",
  "ci cd": "CI/CD",
  "github actions": "GitHub Actions",
  "jenkins": "Jenkins",
  "rest": "REST API",
  "rest api": "REST API",
  "restful": "REST API",
  "graphql": "GraphQL",
  "grpc": "gRPC",
  "kafka": "Apache Kafka",
  "apache kafka": "Apache Kafka",
  "rabbitmq": "RabbitMQ",
  "redis": "Redis",
  "nginx": "Nginx",
  "linux": "Linux",
  "git": "Git",
  "agile": "Agile",
  "scrum": "Scrum",
  "jira": "Jira",
  "tailwind": "Tailwind CSS",
  "tailwindcss": "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  "material ui": "Material UI",
  "mui": "Material UI",
  "sass": "Sass",
  "scss": "Sass",
  "less": "Less",
  "webpack": "Webpack",
  "vite": "Vite",
  "nextjs": "Next.js",
  "next.js": "Next.js",
  "nuxtjs": "Nuxt.js",
  "nuxt.js": "Nuxt.js",
  "vuejs": "Vue.js",
  "vue.js": "Vue.js",
  "vue": "Vue.js",
  "angular": "Angular",
  "svelte": "Svelte",
  "express": "Express.js",
  "express.js": "Express.js",
  "expressjs": "Express.js",
  "fastapi": "FastAPI",
  "flask": "Flask",
  "django": "Django",
  "spring boot": "Spring Boot",
  "spring": "Spring Boot",
  "nestjs": "NestJS",
  "nest.js": "NestJS",
  "rails": "Ruby on Rails",
  "ruby on rails": "Ruby on Rails",
  "laravel": "Laravel",
  "dotnet": ".NET",
  ".net": ".NET",
  "asp.net": "ASP.NET",
  "pytorch": "PyTorch",
  "tensorflow": "TensorFlow",
  "scikit-learn": "Scikit-learn",
  "sklearn": "Scikit-learn",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "opencv": "OpenCV",
  "langchain": "LangChain",
  "openai": "OpenAI API",
  "huggingface": "Hugging Face",
  "hugging face": "Hugging Face",
  "llm": "LLM",
  "machine learning": "Machine Learning",
  "ml": "Machine Learning",
  "deep learning": "Deep Learning",
  "dl": "Deep Learning",
  "nlp": "NLP",
  "natural language processing": "NLP",
  "computer vision": "Computer Vision",
  "cv": "Computer Vision",
};

for (const [alias, canonical] of Object.entries(EXTRA_ALIASES)) {
  NORMALIZATION_MAP[alias.toLowerCase()] = canonical;
}

/**
 * Normalize a skill/technology name to its canonical form.
 * Returns the canonical name if found, or the original with title-casing.
 */
function normalizeSkill(raw: string): string {
  const key = raw.toLowerCase().trim();
  if (NORMALIZATION_MAP[key]) {
    return NORMALIZATION_MAP[key];
  }
  // Return original — don't discard unknown skills from JDs
  return raw.trim();
}

/**
 * Normalize and deduplicate an array of skills.
 */
function normalizeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const skill of skills) {
    const normalized = normalizeSkill(skill);
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }

  return result;
}

// ─── Seniority Detection ────────────────────────────────────

const VALID_SENIORITY: SeniorityLevel[] = [
  "intern", "junior", "mid", "senior", "lead", "staff",
];

function validateSeniority(level: string): SeniorityLevel {
  const normalized = level.toLowerCase().trim();
  if (VALID_SENIORITY.includes(normalized as SeniorityLevel)) {
    return normalized as SeniorityLevel;
  }
  // Common LLM aliases
  if (normalized.includes("entry") || normalized.includes("associate")) return "junior";
  if (normalized.includes("principal") || normalized.includes("staff")) return "staff";
  if (normalized.includes("lead") || normalized.includes("manager")) return "lead";
  if (normalized.includes("senior") || normalized.includes("sr")) return "senior";
  if (normalized.includes("intern") || normalized.includes("trainee")) return "intern";
  return "mid"; // Default fallback
}

// ─── LLM Prompt ─────────────────────────────────────────────

const JD_EXTRACTION_PROMPT = `You are a precise job description analysis engine. Extract structured data from the given job description.

RULES:
- Extract ONLY information explicitly stated in the JD text
- Do NOT infer or hallucinate information not present
- Do NOT extract company name — focus purely on the role
- For seniority_level, choose exactly one of: "intern", "junior", "mid", "senior", "lead", "staff"
- For domain, classify into one of: "fintech", "healthtech", "edtech", "e-commerce", "social media", "enterprise SaaS", "developer tools", "cybersecurity", "gaming", "media/entertainment", "logistics", "real estate", "travel", "food tech", "HR tech", "legal tech", "agritech", "IoT", "blockchain/web3", "AI/ML platform", "cloud infrastructure", "data analytics", "general software"
- List technologies as specific tool/library names (e.g., "React" not "frontend framework")
- Keywords should be ATS-optimized terms a resume scanner would look for

Output a single JSON object with this exact schema:
{
  "title": "string — the job title/role name",
  "seniority_level": "string — one of: intern, junior, mid, senior, lead, staff",
  "required_skills": ["string — hard requirements, must-have skills"],
  "preferred_skills": ["string — nice-to-have, bonus skills"],
  "technologies": ["string — specific technologies, frameworks, tools mentioned"],
  "domain": "string — industry/domain classification",
  "responsibilities": ["string — key responsibilities"],
  "keywords": ["string — ATS keywords to target in a resume"]
}`;

// ─── JSON Parsing ───────────────────────────────────────────

function cleanJSON(text: string): unknown {
  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── Main Parser ────────────────────────────────────────────

export interface JdParserOptions {
  groqKey: string;
  model?: string;
}

/**
 * Parse a raw job description text into a structured ParsedJobDescription.
 *
 * Uses Groq LLM with JSON output mode for reliable structured extraction.
 * All skill/technology names are normalized against the DEP_TO_SKILL map.
 *
 * @param rawText - The raw job description text pasted by the user
 * @param options - Groq API key and optional model override
 * @returns Structured ParsedJobDescription
 * @throws Error if the LLM call fails or returns unparseable output
 */
export async function parseJobDescription(
  rawText: string,
  options: JdParserOptions
): Promise<ParsedJobDescription> {
  const { groqKey, model = "llama-3.3-70b-versatile" } = options;

  if (!rawText || rawText.trim().length < 20) {
    throw new Error("Job description text is too short to analyze. Please provide a complete JD.");
  }

  const userMessage = `Analyze this job description and extract structured data:\n\n---\n${rawText.slice(0, 8000)}\n---`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: JD_EXTRACTION_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for consistent extraction
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq JD parser API error:", response.status, errorText);
    throw new Error(`Failed to parse job description: Groq API error ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Failed to parse job description: empty LLM response");
  }

  let raw: Record<string, unknown>;
  try {
    raw = cleanJSON(content) as Record<string, unknown>;
  } catch (e) {
    console.error("Failed to parse JD extraction JSON:", content);
    throw new Error("Failed to parse job description: invalid JSON from LLM");
  }

  // Validate and normalize the output
  const parsed: ParsedJobDescription = {
    title: typeof raw.title === "string" ? raw.title.trim() : "Unknown Role",
    seniority_level: validateSeniority(
      typeof raw.seniority_level === "string" ? raw.seniority_level : "mid"
    ),
    required_skills: normalizeSkills(
      Array.isArray(raw.required_skills) ? raw.required_skills.map(String) : []
    ),
    preferred_skills: normalizeSkills(
      Array.isArray(raw.preferred_skills) ? raw.preferred_skills.map(String) : []
    ),
    technologies: normalizeSkills(
      Array.isArray(raw.technologies) ? raw.technologies.map(String) : []
    ),
    domain: typeof raw.domain === "string" ? raw.domain.trim() : "general software",
    responsibilities: Array.isArray(raw.responsibilities)
      ? raw.responsibilities.map(String).map((s) => s.trim()).filter(Boolean)
      : [],
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords.map(String).map((s) => s.trim()).filter(Boolean)
      : [],
  };

  return parsed;
}
