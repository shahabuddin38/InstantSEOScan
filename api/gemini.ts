import { GoogleGenAI } from "@google/genai";

function safeParseJSON(text: string | undefined, fallback: any) {
  const raw = String(text || "").trim();
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch?.[1]) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey: key });
}

function parsePayload(payloadRaw: unknown) {
  if (typeof payloadRaw !== "string") return {};
  try {
    return JSON.parse(payloadRaw);
  } catch {
    return {};
  }
}

async function runGeminiPrompt(prompt: string, fallback: any) {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });
  return safeParseJSON(response.text, fallback);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const action = String(req.query?.action || "health");
    const payload = parsePayload(req.query?.payload);

    if (action === "health") {
      return res.status(200).json({ message: "API working" });
    }

    if (action === "insights") {
      const url = String(payload.url || "");
      const technicalData = payload.technicalData || {};
      const content = String(payload.content || "").substring(0, 5000);

      const result = await runGeminiPrompt(
        `Analyze this website for SEO: ${url}. 
      Technical Data: ${JSON.stringify(technicalData)}
      Page Content: ${content}

      Provide a detailed SEO audit in JSON format with the following keys:
      1. "keywordUsage": Analysis of how keywords are used.
      2. "missingHeadings": Identification of missing or suboptimal headings.
      3. "contentGaps": Topics or information missing from the page.
      4. "readability": Assessment of text readability.
      5. "intentMatch": How well the content matches search intent.
      6. "nlpSuggestions": NLP-based improvement suggestions.
      7. "faq": 3-4 generated FAQs based on the content.
      8. "improvements": Array of 3-5 actionable technical/content improvements (each with "title" and "description").`,
        {}
      );

      return res.status(200).json(result);
    }

    if (action === "keywords") {
      const topic = String(payload.topic || "");
      const result = await runGeminiPrompt(
        `Generate SEO keyword ideas for the topic: "${topic}". 
      Return a JSON object with:
      1. "ideas": array of high-volume keywords
      2. "longTail": array of long-tail keywords
      3. "semantic": array of LSI/semantic keywords
      4. "entities": array of related entities
      5. "questions": array of question-based keywords (People Also Ask style).`,
        { ideas: [], longTail: [], semantic: [], entities: [], questions: [] }
      );

      return res.status(200).json(result);
    }

    if (action === "rewrite") {
      const content = String(payload.content || "");
      const targetKeyword = String(payload.targetKeyword || "");

      const result = await runGeminiPrompt(
        `Rewrite the following content to be highly SEO optimized for the keyword "${targetKeyword}". 
      Content: ${content}
      
      Return a JSON object with:
      1. "rewrittenContent": The full optimized text with proper H1, H2, H3 structure.
      2. "metaDescription": A high-CTR meta description.
      3. "faqs": Array of 3-4 FAQs with answers.
      4. "schema": JSON-LD FAQ schema markup.`,
        { rewrittenContent: "", metaDescription: "", faqs: [], schema: "" }
      );

      return res.status(200).json(result);
    }

    if (action === "aiOverview") {
      const content = String(payload.content || "");
      const result = await runGeminiPrompt(
        `Analyze and optimize this content for Google AI Overviews (SGE).
      Content: ${content}
      
      Return a JSON object with:
      1. "clarityScore": 0-100 score for answer clarity.
      2. "directAnswer": A concise, direct answer paragraph (40-60 words) optimized for AI snippets.
      3. "structuredQA": Array of Q&A pairs.
      4. "entityCoverage": Analysis of how well key entities are covered.
      5. "conversationalTips": Tips to make the tone more conversational and authoritative.`,
        { clarityScore: 0, directAnswer: "", structuredQA: [], entityCoverage: "", conversationalTips: "" }
      );

      return res.status(200).json(result);
    }

    if (action === "schema") {
      const type = String(payload.type || "");
      const data = payload.data || {};

      const result = await runGeminiPrompt(
        `Generate valid JSON-LD schema markup for a ${type} based on this data: ${JSON.stringify(data)}. 
      Return only the JSON-LD object.`,
        {}
      );

      return res.status(200).json(result);
    }

    if (action === "optimizeContent") {
      const url = String(payload.url || "");
      const content = String(payload.content || "");

      const result = await runGeminiPrompt(
        `Analyze this website content for ${url}: ${content}. Provide a JSON object with:
      1. "score": a content quality score (0-100)
      2. "suggestions": array of objects with "title" and "description"
      3. "keywords": array of suggested keywords to include
      4. "readability": a brief assessment of readability.`,
        { score: 0, suggestions: [], keywords: [], readability: "Error analyzing content" }
      );

      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Gemini request failed" });
  }
}
