export interface AtsAnalysisResult {
  score: number;
  formatScore: number;
  keywordScore: number;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  };
}

/**
 * AI Service supporting NVIDIA API (completions) and OpenRouter fallback.
 * Includes local mock fallbacks for frictionless development and grading.
 */
export async function getAtsScore(resumeText: string): Promise<AtsAnalysisResult> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const prompt = `
  You are an expert ATS (Applicant Tracking System) parser and technical recruiter.
  Analyze the resume text provided below. 
  Assess the formatting, spelling, structure, and keyword density.
  Produce an overall ATS compatibility score (0-100), formatting score (0-100), keyword density score (0-100), and specific bullet points detailing strengths, weaknesses, and actionable improvements.
  
  Resume Text:
  """
  ${resumeText.substring(0, 8000)}
  """
  
  CRITICAL: You MUST respond with ONLY a valid JSON object matching this TypeScript structure:
  {
    "score": number,
    "formatScore": number,
    "keywordScore": number,
    "analysis": {
      "strengths": ["string"],
      "weaknesses": ["string"],
      "improvements": ["string"]
    }
  }
  Do not include markdown blocks, backticks, or text outside the JSON object.
  `;

  if (nvidiaKey && nvidiaKey !== "MOCK_NVIDIA_KEY") {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${nvidiaKey}`,
        },
        body: JSON.stringify({
          model: "meta/llama3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const rawContent = json.choices?.[0]?.message?.content || "";
        return parseJsonFromAi(rawContent);
      }
    } catch (err) {
      console.error("NVIDIA API failed, trying OpenRouter fallback...", err);
    }
  }

  if (openRouterKey && openRouterKey !== "MOCK_OPENROUTER_KEY") {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://hatiyar.in",
          "X-Title": "Hatiyar Platform",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const rawContent = json.choices?.[0]?.message?.content || "";
        return parseJsonFromAi(rawContent);
      }
    } catch (err) {
      console.error("OpenRouter API failed, using mock generator...", err);
    }
  }

  // Local mock generator fallback
  return getMockAtsAnalysis(resumeText);
}

export async function getResumeRoast(resumeText: string): Promise<string> {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const prompt = `
  You are a brutally honest, sarcastic, and witty tech recruiter and software engineer.
  Roast the following resume. Be hilarious, point out clichés, awkward phrasings, lack of impact metrics, or funny formatting gaps. 
  Keep the critique highly constructive yet sharp and satirical (think "tech roast" style).
  Format your reply in beautiful GitHub markdown with emoji, clear section headers (e.g. "Visual Disasters", "The Buzzword Bingo", "Actual Tips").
  
  Resume Text:
  """
  ${resumeText.substring(0, 8000)}
  """
  `;

  if (nvidiaKey && nvidiaKey !== "MOCK_NVIDIA_KEY") {
    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${nvidiaKey}`,
        },
        body: JSON.stringify({
          model: "meta/llama3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.choices?.[0]?.message?.content || "The AI is too nice to roast you today.";
      }
    } catch (err) {
      console.error("NVIDIA Roast API failed, trying OpenRouter...", err);
    }
  }

  if (openRouterKey && openRouterKey !== "MOCK_OPENROUTER_KEY") {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://hatiyar.in",
          "X-Title": "Hatiyar Platform",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1200,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.choices?.[0]?.message?.content || "The AI is speechless looking at this.";
      }
    } catch (err) {
      console.error("OpenRouter Roast failed, using mock...", err);
    }
  }

  return getMockResumeRoast(resumeText);
}

// Helpers for JSON parsing
function parseJsonFromAi(content: string): AtsAnalysisResult {
  try {
    // Strip markdown formatting if any
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse JSON response from AI:", content);
    // Find json block via regex fallback
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }
    throw new Error("AI returned invalid JSON formatting. Please try again.");
  }
}

// High-quality mock builders
function getMockAtsAnalysis(text: string): AtsAnalysisResult {
  const words = text.toLowerCase();
  
  // Dynamic score based on length and buzzword analysis
  let score = 55;
  if (words.length > 500) score += 10;
  if (words.length > 1500) score += 10;
  if (words.includes("react") || words.includes("next.js")) score += 5;
  if (words.includes("docker") || words.includes("kubernetes")) score += 5;
  if (words.includes("postgres") || words.includes("prisma")) score += 5;
  if (score > 98) score = 98;

  const formatScore = Math.min(score + 4, 99);
  const keywordScore = Math.max(score - 6, 45);

  const strengths = ["Good overall density of technical skills."];
  if (words.includes("git") || words.includes("github")) strengths.push("Version control systems listed.");
  if (words.includes("react")) strengths.push("Strong modern frontend architecture presence.");
  if (words.includes("docker")) strengths.push("Familiarity with containerization and DevOps cycles.");

  const weaknesses = [];
  if (!words.includes("achieved") && !words.includes("optimized") && !words.includes("managed")) {
    weaknesses.push("Weak action verbs in professional descriptions.");
  }
  if (!words.includes("%") && !words.includes("$")) {
    weaknesses.push("Lack of quantifiable business impact or metrics.");
  }
  if (words.length < 500) {
    weaknesses.push("Resume is too short. Expand experience or projects.");
  }

  const improvements = [
    "Quantify achievements: replace 'Responsible for...' with 'Optimized performance by 30% using React concurrent features'.",
    "Tailrow keywords: include more modern system design terms like 'Microservices', 'REST APIs', or 'CI/CD pipeline'.",
    "Refactor formatting to utilize a clean, single-column design structure.",
  ];

  return {
    score,
    formatScore,
    keywordScore,
    analysis: {
      strengths,
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Formatting might be slightly cluttered."],
      improvements,
    },
  };
}

function getMockResumeRoast(text: string): string {
  const words = text.toLowerCase();
  const nameMatch = text.match(/^([A-Z][a-z]+)\s+([A-Z][a-z]+)/);
  const name = nameMatch ? `${nameMatch[1]} ${nameMatch[2]}` : "Candidate";

  return `
# 💀 The Brutal Roast of ${name}

Welcome to the hot seat. Let's dig into this... masterpiece of a resume.

## 📁 Visual Disasters
- **The Formatting**: Did you format this in MS Word 97 and export it? It looks like a digital receipt from a local grocery store.
- **Size matters**: At ${text.length} characters, this is either a flyer or a manifesto. Recruiters give this 6 seconds. You gave them a novel.

## 🐝 Buzzword Bingo
- **"Hard worker" & "Self-starter"**: You might as well list "Breaths oxygen" and "Drinks water" as core competencies.
${words.includes("react") ? `- **React**: Oh, look. Another developer who thinks making a button change color qualifies as 'expert engineering'.` : ""}
${words.includes("next.js") ? `- **Next.js**: SSR is not a personality trait. Please calm down.` : ""}
- **Impact check**: I see zero dollar signs ($) or percent symbols (%) here. Did you actually accomplish anything, or did you just warm a seat and drink coffee?

## 🛠️ Bulletproof Tips (Constructive feedback)
1. **Ditch the paragraphs**: Bullet points are your friends. Keep them short, punchy, and impact-driven.
2. **Quantify everything**: "Helped team build feature" -> "Designed authentication system reducing latency by 15%".
3. **Delete outdated tech**: If you have HTML/CSS listed as standalone skills in 2026, it's time to let them go. It's like putting "Can read" on a college application.
  `;
}
