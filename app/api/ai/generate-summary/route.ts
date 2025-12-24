import { NextResponse } from "next/server";
import { mockLeads } from "@/lib/mock-data";
import { googleGenAI } from "@/lib/ai/lead-summary";

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    const lead = mockLeads.find((l) => l.id === leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const messages = lead.messages;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages to summarize" },
        { status: 400 }
      );
    }

    // Try to use Google Generative AI if key exists
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        console.log("Using Google Generative AI");

        const prompt = `
          Analyze the following conversation messages from a potential lead.
          Extract the following information:
          1. Budget: (Estimate if mentioned, otherwise "Not specified")
          2. Timeline: (Estimate if mentioned, otherwise "Not specified")
          3. Service Type: (What are they looking for?)
          4. Summary: A concise 2-sentence summary of their needs.

          Messages:
          ${messages.map((m) => "- " + m).join("\n")}
          
          Return the response in JSON format like this:
          {
            "budget": "...",
            "timeline": "...",
            "serviceType": "...",
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

        return NextResponse.json(data);
      } catch (error) {
        console.error("AI Generation failed, falling back to mock:", error);
        // Fallback to mock if API call fails
      }
    }

    // MOCK RESPONSE (Fallback)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    let mockResponse;
    if (leadId === "1") {
      mockResponse = {
        budget: "$50k annually",
        timeline: "Onboard in January (decision by next month)",
        serviceType: "Enterprise Solution",
        summary:
          "Lead represents a team of 55 scaling to 80. Needs enterprise features, SSO, and clear audit trails.",
      };
    } else if (leadId === "2") {
      mockResponse = {
        budget: "$500/month",
        timeline: "Live within 2 weeks",
        serviceType: "SMB Package (Analytics focus)",
        summary:
          "Small startup looking for a quick launch. Interested in analytics but price sensitive.",
      };
    } else if (leadId === "3") {
      mockResponse = {
        budget: "$1-2k/month",
        timeline: "Before March",
        serviceType: "Unified Inbox",
        summary:
          "Agency owner needing better client comms management for 12 account managers.",
      };
    } else if (leadId === "4") {
      mockResponse = {
        budget: "$120k",
        timeline: "Immediate implementation",
        serviceType: "Enterprise License",
        summary:
          "Ready to purchase annual enterprise license. Procurement approved.",
      };
    } else if (leadId === "5") {
      mockResponse = {
        budget: "Not specified",
        timeline: "Not specified",
        serviceType: "API / GraphQL Integration",
        summary:
          "Technical feasibility study. Asking about GraphQL support for internal dashboard integration.",
      };
    } else {
      mockResponse = {
        budget: "Not specified",
        timeline: "Not specified",
        serviceType: "General Inquiry",
        summary: "Lead is inquiring about general features/pricing.",
      };
    }

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
