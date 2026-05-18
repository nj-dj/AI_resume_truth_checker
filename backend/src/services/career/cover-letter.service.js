import { generateStructuredJson } from "../ai/structured-json.js";

const tones = new Set(["professional", "confident", "friendly", "executive"]);

class CoverLetterService {
  async generate({ candidateName, roleTitle, companyName, highlights, tone = "professional", jobDescriptionSnippet = "" }) {
    const normalizedTone = tones.has(tone) ? tone : "professional";

    const data = await generateStructuredJson({
      purpose: "cover_letter",
      fallbackData: this.buildFallbackLetter({
        candidateName,
        roleTitle,
        companyName,
        highlights,
        tone: normalizedTone,
      }),
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

  buildFallbackLetter({ candidateName, roleTitle, companyName, highlights = [], tone }) {
    const company = companyName || "your team";
    const candidate = candidateName || "the candidate";
    const safeHighlights = Array.isArray(highlights) ? highlights.filter(Boolean).slice(0, 4) : [];
    const highlightSentence = safeHighlights.length
      ? `My background includes ${safeHighlights.join("; ")}.`
      : "My background includes relevant experience, practical delivery, and a focus on measurable outcomes.";

    return {
      subject_line: `Application for ${roleTitle} - ${candidate}`,
      body_markdown: [
        `Dear ${companyName ? `${companyName} team` : "Hiring team"},`,
        "",
        `I am writing to express my interest in the ${roleTitle} role at ${company}. ${highlightSentence}`,
        "",
        "I would welcome the opportunity to discuss how my experience can support your goals and contribute to the team.",
        "",
        `Sincerely,\n${candidate}`,
      ].join("\n"),
      call_to_action: "I would be glad to discuss the role and share more context about my relevant work.",
      tone,
    };
  }
}

export const coverLetterService = new CoverLetterService();
