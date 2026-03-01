import axios from "axios";

async function callGemini<T>(action: string, payload: Record<string, any>, fallback: T): Promise<T> {
  try {
    const response = await axios.post("/api/ai/gemini", {
      action,
      payload: payload || {},
    });
    console.log("Gemini API Response:", response.data);
    return (response.data as T) ?? fallback;
  } catch (error) {
    console.error("Gemini API route error:", error);
    return fallback;
  }
}

export async function getAIInsights(url: string, technicalData: any, content: string = "") {
  const safeContent = String(content || "").substring(0, 5000);
  const fallbackData = {
    keywordUsage: "AI Analysis unavailable. Please configure a valid GEMINI_API_KEY.",
    readability: "AI Analysis unavailable. Please configure a valid GEMINI_API_KEY.",
    nlpSuggestions: "AI Analysis unavailable. Please configure a valid GEMINI_API_KEY.",
    contentGaps: "AI Analysis unavailable. Please configure a valid GEMINI_API_KEY.",
    intentMatch: "AI Analysis unavailable. Please configure a valid GEMINI_API_KEY.",
    missingHeadings: "AI Analysis unavailable. Please configure a valid GEMINI_API_KEY."
  };
  return callGemini("insights", { url, technicalData, content: safeContent }, fallbackData);
}

export async function generateKeywords(topic: string) {
  return callGemini("keywords", { topic }, { ideas: [], longTail: [], semantic: [], entities: [], questions: [] });
}

export async function rewriteForSEO(content: string, targetKeyword: string) {
  return callGemini("rewrite", { content, targetKeyword }, { rewrittenContent: "", metaDescription: "", faqs: [], schema: "" });
}

export async function optimizeForAIOverview(content: string) {
  return callGemini("aiOverview", { content }, { clarityScore: 0, directAnswer: "", structuredQA: [], entityCoverage: "", conversationalTips: "" });
}

export async function generateSchema(type: string, data: any) {
  return callGemini("schema", { type, data }, {});
}

export function calculateScore(technical: any) {
  let score = 100;
  if (technical.title === "Missing") score -= 20;
  if (technical.description === "Missing") score -= 20;
  if (technical.h1Count === 0) score -= 10;
  if (technical.imgAltMissing > 5) score -= 10;
  return Math.max(0, score);
}

export async function optimizeContent(url: string, content: string) {
  return callGemini("optimizeContent", { url, content }, { score: 0, suggestions: [], keywords: [], readability: "Error analyzing content" });
}
