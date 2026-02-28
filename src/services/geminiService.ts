import { GoogleGenAI } from "@google/genai";

export async function getAIInsights(url: string, technicalData: any, content: string = "") {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const safeContent = String(content || "").substring(0, 5000);
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this website for SEO: ${url}. 
      Technical Data: ${JSON.stringify(technicalData)}
      Page Content: ${safeContent}

      Provide a detailed SEO audit in JSON format with the following keys:
      1. "keywordUsage": Analysis of how keywords are used.
      2. "missingHeadings": Identification of missing or suboptimal headings.
      3. "contentGaps": Topics or information missing from the page.
      4. "readability": Assessment of text readability.
      5. "intentMatch": How well the content matches search intent.
      6. "nlpSuggestions": NLP-based improvement suggestions.
      7. "faq": 3-4 generated FAQs based on the content.
      8. "improvements": Array of 3-5 actionable technical/content improvements (each with "title" and "description").`,
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {};
  }
}

export async function generateKeywords(topic: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate SEO keyword ideas for the topic: "${topic}". 
      Return a JSON object with:
      1. "ideas": array of high-volume keywords
      2. "longTail": array of long-tail keywords
      3. "semantic": array of LSI/semantic keywords
      4. "entities": array of related entities
      5. "questions": array of question-based keywords (People Also Ask style).`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return { ideas: [], longTail: [], semantic: [], entities: [], questions: [] };
  }
}

export async function rewriteForSEO(content: string, targetKeyword: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Rewrite the following content to be highly SEO optimized for the keyword "${targetKeyword}". 
      Content: ${content}
      
      Return a JSON object with:
      1. "rewrittenContent": The full optimized text with proper H1, H2, H3 structure.
      2. "metaDescription": A high-CTR meta description.
      3. "faqs": Array of 3-4 FAQs with answers.
      4. "schema": JSON-LD FAQ schema markup.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return { rewrittenContent: "", metaDescription: "", faqs: [], schema: "" };
  }
}

export async function optimizeForAIOverview(content: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze and optimize this content for Google AI Overviews (SGE).
      Content: ${content}
      
      Return a JSON object with:
      1. "clarityScore": 0-100 score for answer clarity.
      2. "directAnswer": A concise, direct answer paragraph (40-60 words) optimized for AI snippets.
      3. "structuredQA": Array of Q&A pairs.
      4. "entityCoverage": Analysis of how well key entities are covered.
      5. "conversationalTips": Tips to make the tone more conversational and authoritative.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return { clarityScore: 0, directAnswer: "", structuredQA: [], entityCoverage: "", conversationalTips: "" };
  }
}

export async function generateSchema(type: string, data: any) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate valid JSON-LD schema markup for a ${type} based on this data: ${JSON.stringify(data)}. 
      Return only the JSON-LD object.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {};
  }
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
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this website content for ${url}: ${content}. Provide a JSON object with:
      1. "score": a content quality score (0-100)
      2. "suggestions": array of objects with "title" and "description"
      3. "keywords": array of suggested keywords to include
      4. "readability": a brief assessment of readability.`,
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return { score: 0, suggestions: [], keywords: [], readability: "Error analyzing content" };
  }
}
