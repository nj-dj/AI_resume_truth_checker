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
      fallbackData: this.buildFallbackEnhancement({ resumeText, jobDescription, focus }),
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

  buildFallbackEnhancement({ resumeText, jobDescription = "", focus = "general" }) {
    const lines = resumeText
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter((line) => line.length >= 20)
      .slice(0, 6);

    const bulletUpgrades = lines.map((line) => ({
      original: line,
      improved: this.rewriteBullet(line),
      rationale: "Fallback rewrite focused on action language, clarity, and measurable impact without inventing facts.",
    }));

    return {
      rewritten_summary:
        lines[0] ??
        "Professional candidate with experience that should be summarized with clear role focus, core tools, and measurable outcomes.",
      bullet_upgrades: bulletUpgrades,
      grammar_and_wording_notes: [
        "Start bullets with strong action verbs.",
        "Keep tense consistent across current and past roles.",
        "Replace vague phrases with specific tools, scope, and outcomes where available.",
      ],
      action_verbs_used: ["Built", "Improved", "Delivered", "Optimized", "Collaborated"],
      measurable_achievement_ideas: [
        "Add percentages, time saved, revenue impact, latency reduction, user growth, or delivery volume where truthful.",
        "Mention team size, project scale, or production usage when available.",
      ],
      ats_keyword_suggestions: this.extractFallbackKeywords(jobDescription),
      keyword_alignment_notes: `Local fallback generated because the AI provider was unavailable. Focus mode: ${focus}.`,
    };
  }

  rewriteBullet(line) {
    const trimmed = line.replace(/\s+/g, " ").trim();
    if (!trimmed) {
      return "";
    }

    return `Delivered ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}, with clearer scope and measurable impact where evidence is available.`;
  }

  extractFallbackKeywords(jobDescription) {
    return [
      ...new Set(
        jobDescription
          .split(/[^a-zA-Z+#.]+/)
          .map((word) => word.trim())
          .filter((word) => word.length > 3)
          .slice(0, 12),
      ),
    ];
  }
}

export const resumeEnhancerService = new ResumeEnhancerService();
