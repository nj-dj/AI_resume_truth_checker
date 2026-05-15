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
}

export const atsScannerService = new AtsScannerService();
