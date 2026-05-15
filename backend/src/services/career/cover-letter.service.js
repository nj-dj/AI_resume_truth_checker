import { generateStructuredJson } from "../ai/structured-json.js";

const tones = new Set(["professional", "confident", "friendly", "executive"]);

class CoverLetterService {
  async generate({ candidateName, roleTitle, companyName, highlights, tone = "professional", jobDescriptionSnippet = "" }) {
    const normalizedTone = tones.has(tone) ? tone : "professional";

    const data = await generateStructuredJson({
      purpose: "cover_letter",
      prompt: `Write a tailored cover letter as JSON only.

Return ONLY JSON:
{
  "subject_line": "",
  "body_markdown": "",
  "call_to_action": ""
}

Tone: ${normalizedTone}
Candidate: ${candidateName}
Role: ${roleTitle}
Company: ${companyName || "Hiring team"}
Key highlights (bullets the letter should echo truthfully):
${JSON.stringify(highlights ?? [])}

Job context (optional excerpt):
${jobDescriptionSnippet || "Not provided"}
`,
    });

    return {
      success: true,
      data: {
        tone: normalizedTone,
        subjectLine: data.subject_line ?? "",
        bodyMarkdown: data.body_markdown ?? "",
        callToAction: data.call_to_action ?? "",
      },
    };
  }
}

export const coverLetterService = new CoverLetterService();
