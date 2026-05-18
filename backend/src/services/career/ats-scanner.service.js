import { generateStructuredJson } from "../ai/structured-json.js";
import { documentTextService } from "../document-text.service.js";
import { detectFormattingSignals, extractKeywordCandidates, scoreKeywordCoverage } from "./ats-helpers.js";

const truncate = (text, max = 12000) => {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, max)}\n...[truncated]`;
};

class AtsScannerService {
  async scanFromFile({ file, jobDescription }) {
    const resumeText = await documentTextService.extractTextFromFile(file);
    return this.scanFromText({ resumeText, jobDescription });
  }

  async scanFromText({ resumeText, jobDescription }) {
    const jdKeywords = extractKeywordCandidates(jobDescription);
    const { score: keywordScore, matched, missing } = scoreKeywordCoverage(resumeText, jdKeywords.slice(0, 60));
    const formattingIssues = detectFormattingSignals(resumeText);

    const readabilityPenalty = Math.min(15, formattingIssues.length * 5);
    const atsScore = Math.max(0, Math.min(100, Math.round(keywordScore * 0.75 + (25 - readabilityPenalty))));

    const ai = await generateStructuredJson({
      purpose: "ats_scan",
      fallbackData: {
        optimization_suggestions: this.buildFallbackSuggestions({ missing, formattingIssues }),
        additional_missing_keywords: [],
        keyword_placement_tips: this.buildFallbackPlacementTips(missing),
      },
      prompt: `You are an expert ATS (applicant tracking system) coach.

Given a resume and a job description, return concise optimization guidance as JSON only.

Return JSON with this exact shape:
{
  "optimization_suggestions": ["string"],
  "additional_missing_keywords": ["string"],
  "keyword_placement_tips": ["string"]
}

Rules:
- additional_missing_keywords: important role-specific terms from the JD not obviously present in the resume (max 12 items, single words or short phrases).
- Do not repeat items already in this list: ${JSON.stringify(missing.slice(0, 20))}
- Be practical and non-speculative about employment facts.

Job description:
${truncate(jobDescription, 8000)}

Resume:
${truncate(resumeText, 8000)}
`,
    });

    const mergedMissing = [...new Set([...missing, ...(Array.isArray(ai.additional_missing_keywords) ? ai.additional_missing_keywords : [])])]
      .filter(Boolean)
      .slice(0, 25);

    return {
      success: true,
      data: {
        atsScore,
        keywordMatchScore: keywordScore,
        matchedKeywords: matched,
        missingKeywords: mergedMissing,
        formattingIssues,
        optimizationSuggestions: Array.isArray(ai.optimization_suggestions) ? ai.optimization_suggestions.filter(Boolean).slice(0, 12) : [],
        keywordPlacementTips: Array.isArray(ai.keyword_placement_tips) ? ai.keyword_placement_tips.filter(Boolean).slice(0, 8) : [],
      },
    };
  }

  buildFallbackSuggestions({ missing, formattingIssues }) {
    const suggestions = [];

    if (missing.length) {
      suggestions.push(`Add the most relevant missing keywords naturally: ${missing.slice(0, 8).join(", ")}.`);
    }

    if (formattingIssues.length) {
      suggestions.push("Clean up resume formatting so section headings, bullet points, and contact details are easy for ATS systems to parse.");
    }

    suggestions.push("Mirror the target job description with truthful project, impact, and tool-specific language.");
    suggestions.push("Prioritize measurable outcomes near the top of each role or project section.");

    return suggestions;
  }

  buildFallbackPlacementTips(missing) {
    return [
      "Place role-critical keywords in the summary, skills, and most relevant experience bullets.",
      missing.length ? `Group related terms such as ${missing.slice(0, 5).join(", ")} under a clear skills section.` : "Keep keyword placement specific and tied to real work.",
      "Avoid keyword stuffing; each term should connect to a concrete responsibility or result.",
    ];
  }
}

export const atsScannerService = new AtsScannerService();
