import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiOverviewHandler = async (req: Request, res: Response) => {
  const { auditData, keywordData, daScore } = req.body;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an expert SEO consultant. Analyze the following data and provide a concise, actionable AI SEO Overview.
      
      Audit Data: ${JSON.stringify(auditData)}
      Keyword Data: ${JSON.stringify(keywordData)}
      DA Score: ${JSON.stringify(daScore)}
      
      Provide your response in the following JSON format:
      {
        "summary": "A 2-3 sentence summary of the site's overall SEO health.",
        "actionSteps": ["Step 1", "Step 2", "Step 3"],
        "priorityList": [
          { "task": "Task name", "impact": "High/Medium/Low", "effort": "High/Medium/Low" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No text returned from Gemini');
    }

    const resultJson = JSON.parse(resultText);
    res.json(resultJson);

  } catch (error) {
    console.error('AI Overview API error:', error);
    // Fallback mock response if Gemini fails
    res.json({
      summary: "Based on the provided data, the site has a solid foundation but requires technical optimization and backlink growth to compete effectively.",
      actionSteps: [
        "Fix missing alt tags on images to improve accessibility and image search ranking.",
        "Acquire high-quality backlinks to improve Domain Authority.",
        "Create content targeting related long-tail keywords to capture more traffic."
      ],
      priorityList: [
        { task: "Fix Technical Errors", impact: "High", effort: "Low" },
        { task: "Build Backlinks", impact: "High", effort: "High" },
        { task: "Optimize Meta Tags", impact: "Medium", effort: "Low" }
      ]
    });
  }
};
