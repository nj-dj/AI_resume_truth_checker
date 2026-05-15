import { generateStructuredJson } from "../ai/structured-json.js";
import { documentTextService } from "../document-text.service.js";

const truncate = (text, max = 10000) => {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max)}\n...[truncated]`;
};

class ResumeEnhancerService {
  async enhanceFromFile({ file, jobDescription = "", focus = "general" }) {
    const resumeText = await documentTextService.extractTextFromFile(file);
    return this.enhanceFromText({ resumeText, jobDescription, focus });
  }

  async enhanceFromText({ resumeText, jobDescription = "", focus = "general" }) {
    const data = await generateStructuredJson({
      purpose: "resume_enhance",
      prompt: `You are an elite resume writer and ATS strategist.

Improve the resume for clarity, impact, and measurable outcomes. Respect factual content: do not invent employers, dates, degrees, or metrics that are not reasonably implied.

Return ONLY JSON:
{
  "rewritten_summary": "",
  "bullet_upgrades": [
    { "original": "", "improved": "", "rationale": "" }
  ],
  "grammar_and_wording_notes": ["string"],
  "action_verbs_used": ["string"],
  "measurable_achievement_ideas": ["string"],
  "ats_keyword_suggestions": ["string"],
  "keyword_alignment_notes": ""
}

Focus mode: ${focus}
${jobDescription ? `Target job description (for keyword alignment):\n${truncate(jobDescription, 6000)}\n` : ""}

Resume text:
${truncate(resumeText, 10000)}
`,
    });

    return {
      success: true,
      data: {
        rewrittenSummary: data.rewritten_summary ?? "",
        bulletUpgrades: Array.isArray(data.bullet_upgrades) ? data.bullet_upgrades : [],
        grammarAndWordingNotes: Array.isArray(data.grammar_and_wording_notes) ? data.grammar_and_wording_notes : [],
        actionVerbsUsed: Array.isArray(data.action_verbs_used) ? data.action_verbs_used : [],
        measurableAchievementIdeas: Array.isArray(data.measurable_achievement_ideas) ? data.measurable_achievement_ideas : [],
        atsKeywordSuggestions: Array.isArray(data.ats_keyword_suggestions) ? data.ats_keyword_suggestions : [],
        keywordAlignmentNotes: typeof data.keyword_alignment_notes === "string" ? data.keyword_alignment_notes : "",
      },
    };
  }
}

export const resumeEnhancerService = new ResumeEnhancerService();
