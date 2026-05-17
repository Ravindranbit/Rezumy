// ============================================================
// AI Job Finder Service (Groq + Serper.dev)
// ============================================================

export interface JobListing {
  title: string;
  company: string;
  link: string;
  snippet: string;
  source: string;
  date?: string;
  matchScore: number;
  reason: string;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
  date?: string;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const SERPER_API_URL = "https://google.serper.dev/search";

function cleanJSON(text: string): any {
  try {
    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON from AI response:", text);
    throw e;
  }
}

export async function findJobs(params: {
  resumeSummary: string;
  skills: string[];
  jobRole: string;
  location?: string;
  groqKey: string;
  serperKey: string;
}): Promise<JobListing[]> {
  const { resumeSummary, skills, jobRole, location, groqKey, serperKey } = params;

  // 1. Generate optimized search queries using Groq
  const queryPrompt = `
    You are an expert career assistant. Based on this candidate's profile and target role, generate 6 highly targeted but SIMPLE Google search queries.
    
    CRITICAL: Do NOT use complex operators like "OR", "AND", or parentheses "()". Serper free tier blocks these.
    
    Candidate Role: ${jobRole}
    Skills: ${skills.join(", ")}
    Summary: ${resumeSummary}
    ${location ? `Preferred Location: ${location}` : ""}
    
    Format your response as a JSON array of 8 simple strings.
    Example of GOOD queries:
    - "site:linkedin.com/jobs ${jobRole} ${location || ""}"
    - "site:unstop.com ${jobRole} apply 2025"
    - "site:naukri.com ${jobRole} ${skills[0]} job"
    - "site:myworkdayjobs.com ${jobRole} ${location || ""}"
    - "site:boards.greenhouse.io ${jobRole} careers"
    - "site:jobs.lever.co ${jobRole} hiring"
    - "site:hirist.tech ${jobRole} careers"
    - "site:indeed.com ${jobRole} ${location || ""} 2025"
  `;

  let queries: string[] = [`${jobRole} jobs ${location || ""}`];
  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: queryPrompt }],
        response_format: { type: "json_object" },
      }),
    });
    
    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      throw new Error(`Groq Query API error: ${groqRes.status} - ${errorText}`);
    }

    const groqData = await groqRes.json();
    const content = cleanJSON(groqData.choices[0].message.content);
    const aiQueries = content.queries || content || [];
    
    // Always include a broad fallback query to ensure results
    queries = [
      ...aiQueries,
      `${jobRole} ${location || ""} job hiring 2024 2025`,
      `${jobRole} careers ${location || ""}`
    ].slice(0, 10); // Keep it reasonable
  } catch (err) {
    console.error("Groq query generation failed:", err);
  }

  // 2. Execute searches via Serper.dev
  const allResults: SearchResult[] = [];
  await Promise.all(
    queries.map(async (query) => {
      try {
        const res = await fetch(SERPER_API_URL, {
          method: "POST",
          headers: {
            "X-API-KEY": serperKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ q: query, num: 20 }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Serper API error for "${query}": ${res.status} - ${errorText}`);
          return;
        }

        const data = await res.json();
        if (data.organic) {
          data.organic.forEach((item: any) => {
            allResults.push({
              title: item.title,
              link: item.link,
              snippet: item.snippet,
              source: new URL(item.link).hostname.replace("www.", ""),
              date: item.date,
            });
          });
        }
      } catch (err) {
        console.error(`Search failed for query "${query}":`, err);
      }
    })
  );

  // Deduplicate results by link
  const uniqueResults = Array.from(new Map(allResults.map(r => [r.link, r])).values());

  if (uniqueResults.length === 0) {
    console.warn("No job results found from Serper search.");
    return [];
  }

  // 3. Rank and Score results using Groq
  const resultsToRank = uniqueResults.slice(0, 40);

  const rankPrompt = `
    Analyze these job search results against this candidate's profile.
    Rank the top 25 best matches based on how well the candidate's skills align with the job title and description.
    
    Candidate Skills: ${skills.join(", ")}
    Candidate Summary: ${resumeSummary}
    
    Results:
    ${resultsToRank.map((r, i) => `[${i}] Title: ${r.title} | Source: ${r.source} | Snippet: ${r.snippet}`).join("\n")}
    
    Format your response as a JSON array of objects:
    { "rankings": [
      { "index": number, "score": number (0-100), "reason": "Short 1-sentence explanation of why it matches or what's missing" }
    ]}
  `;

  try {
    const groqRankRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: rankPrompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRankRes.ok) {
      const errorText = await groqRankRes.text();
      throw new Error(`Groq Ranking API error: ${groqRankRes.status} - ${errorText}`);
    }

    const groqRankData = await groqRankRes.json();
    const parsedContent = cleanJSON(groqRankData.choices[0].message.content);
    
    // Resilient extraction: check common keys or the object itself if it's an array
    let rankings = [];
    if (Array.isArray(parsedContent)) {
      rankings = parsedContent;
    } else if (parsedContent.rankings) {
      rankings = parsedContent.rankings;
    } else if (parsedContent.results) {
      rankings = parsedContent.results;
    } else if (parsedContent.matches) {
      rankings = parsedContent.matches;
    }

    const scoredJobs: JobListing[] = (rankings || [])
      .map((rank: any) => {
        // Some models might return the full object in the array instead of just index
        const original = typeof rank.index === 'number' ? resultsToRank[rank.index] : null;
        if (!original) return null;
        return {
          ...original,
          matchScore: rank.score,
          reason: rank.reason,
          company: extractCompany(original.title, original.source),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.matchScore - a.matchScore);

    return scoredJobs;
  } catch (err) {
    console.error("Groq ranking failed:", err);
    return uniqueResults.slice(0, 20).map(r => ({
      ...r,
      matchScore: 0,
      reason: "Could not analyze match quality.",
      company: extractCompany(r.title, r.source),
    }));
  }
}

function extractCompany(title: string, source: string): string {
  // Try to extract company name from common title patterns like "Role at Company"
  const patterns = [
    /at\s+([^|-]+)/i,
    /-\s+([^|-]+)$/i,
    /\|\s+([^|-]+)$/i,
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  
  return source.split('.')[0].charAt(0).toUpperCase() + source.split('.')[0].slice(1);
}
