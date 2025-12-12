import { AIAnalysis } from "@/lib/database.types";

import { GoogleGenAI } from "@google/genai";

export const googleGenAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

export interface GenerateSummaryResult {
  summary: string;
  ai_analysis: AIAnalysis;
}

export async function generateLeadSummary(
  message: string
): Promise<GenerateSummaryResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || !message) {
    return null;
  }

  try {
    const prompt = `
      Analyze the following message from a potential lead.
      Extract the following information:
      1. Budget: (Estimate if mentioned, e.g. "$5000", or "Not specified")
      2. Timeline: (Estimate if mentioned, e.g. "2 months", or "Not specified")
      3. Service Type: (What are they looking for?)
      4. Priority: (Low, Medium, or High based on urgency and budget)
      5. Summary: A concise 2-sentence summary of their needs.

      Message:
      "${message}"
      
      Return the response in JSON format like this:
      {
        "budget": "...",
        "timeline": "...",
        "service_type": "...",
        "priority": "...",
        "summary": "..."
      }
    `;

    const result = await googleGenAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = result.text || "";

    // Clean up markdown code blocks if present
    const jsonStr = text
      .replace(/```json\n|\n```/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(jsonStr);

    return {
      summary: data.summary,
      ai_analysis: {
        budget: data.budget,
        timeline: data.timeline,
        service_type: data.service_type,
        priority: data.priority,
      },
    };
  } catch (error) {
    console.error("AI Generation failed:", error);
    return null;
  }
}
