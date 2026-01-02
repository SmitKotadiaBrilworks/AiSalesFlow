import { GoogleGenAI } from "@google/genai";

const googleGenAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

/**
 * Extracts only the actual reply message from a full email body,
 * removing quoted history, signatures, and other clutter.
 */
export async function cleanEmailReply(fullBody: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || !fullBody || fullBody.length < 10) {
    return fullBody;
  }

  try {
    const prompt = `
      The following is an email message received from a user. 
      It may contain quoted previous messages (often starting with "On ... wrote:"), 
      email signatures, and other boilerplate content.
      
      Your task is to extract ONLY the actual reply message written by the user.
      Remove all historical context, quoted text, and common email signatures.
      
      If the message is short and doesn't seem to have any history, return the original text.
      If the entire message is a quoted reply, try to find the newest response.
      
      Email Body:
      """
      ${fullBody}
      """
      
      Extracted Reply:
    `;

    const result = await googleGenAI.models.generateContent({
      model: "gemini-2.0-flash-exp", // Using a standard model name if 2.5 was a typo
      contents: prompt,
    });

    const text = result.text?.trim() || fullBody;

    // Fallback to original if AI returns nothing useful
    if (!text || text.length === 0) {
      return fullBody;
    }

    return text;
  } catch (error) {
    console.error("AI Clean Reply failed:", error);
    return fullBody;
  }
}
