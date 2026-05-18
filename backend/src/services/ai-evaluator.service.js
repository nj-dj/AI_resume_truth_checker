import { StatusCodes } from "http-status-codes";

import { generateLlmText } from "./ai/llm-provider.js";
import { ApiError } from "../utils/api-error.js";
import { extractJsonStringFromLlm } from "../utils/extract-json-from-llm.js";

class AiEvaluatorService {
  async evaluateCandidate(resumeData, githubData, skillValidation) {
    const normalizedInput = {
      resumeData: this.normalizeResumeData(resumeData),
      githubData: this.normalizeGithubData(githubData),
      skillValidation: this.normalizeSkillValidation(skillValidation),
    };
    const enrichedInput = {
      ...normalizedInput,
      base_score: this.calculateBaseScore(normalizedInput.githubData, normalizedInput.skillValidation),
    };

    try {
      const result = await generateLlmText({
        contents: this.buildEvaluationPrompt(enrichedInput),
        config: {
          temperature: 0,
          responseMimeType: "application/json",
        },
        purpose: "candidate_evaluation",
      });
      const content = result.text;

      if (!content) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "AI provider returned an empty response for candidate evaluation");
      }

      const parsedJson = JSON.parse(extractJsonStringFromLlm(content));
      return this.normalizeEvaluation(parsedJson, enrichedInput);
    } catch (error) {
      if (error instanceof ApiError) {
        return this.createFallbackEvaluation(enrichedInput, error.message);
      }

      return this.createFallbackEvaluation(enrichedInput, error.message);
    }
  }

  normalizeResumeData(resumeData) {
    return {
      name: typeof resumeData?.name === "string" ? resumeData.name.trim() : "",
      skills: Array.isArray(resumeData?.skills)
        ? resumeData.skills.filter((skill) => typeof skill === "string").map((skill) => skill.trim()).filter(Boolean)
        : [],
      experience: Array.isArray(resumeData?.experience)
        ? resumeData.experience.map((item) => ({
            role: typeof item?.role === "string" ? item.role.trim() : "",
            company: typeof item?.company === "string" ? item.company.trim() : "",
            duration: typeof item?.duration === "string" ? item.duration.trim() : "",
            description: typeof item?.description === "string" ? item.description.trim() : "",
          }))
        : [],
      projects: Array.isArray(resumeData?.projects)
        ? resumeData.projects.map((item) => ({
            name: typeof item?.name === "string" ? item.name.trim() : "",
            tech_stack: Array.isArray(item?.tech_stack)
              ? item.tech_stack.filter((tech) => typeof tech === "string").map((tech) => tech.trim()).filter(Boolean)
              : [],
            description: typeof item?.description === "string" ? item.description.trim() : "",
          }))
        : [],
      education: Array.isArray(resumeData?.education)
        ? resumeData.education.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean)
        : [],
    };
  }

  normalizeGithubData(githubData) {
    const repos = Array.isArray(githubData?.repos)
      ? githubData.repos
      : Array.isArray(githubData?.repositories)
        ? githubData.repositories
        : [];

    return {
      username: typeof githubData?.username === "string" ? githubData.username.trim() : "",
      repo_count: Number.isFinite(githubData?.repo_count) ? githubData.repo_count : repos.length,
      top_languages: Array.isArray(githubData?.top_languages)
        ? githubData.top_languages
            .filter((language) => typeof language === "string")
            .map((language) => language.trim())
            .filter(Boolean)
        : [],
      repos: repos.map((repo) => ({
        name: typeof repo?.name === "string" ? repo.name.trim() : "",
        languages: Array.isArray(repo?.languages)
          ? repo.languages.filter((language) => typeof language === "string").map((language) => language.trim()).filter(Boolean)
          : [],
        stars: Number.isFinite(repo?.stars) ? repo.stars : 0,
        forks: Number.isFinite(repo?.forks) ? repo.forks : 0,
        last_updated: typeof repo?.last_updated === "string" ? repo.last_updated : "",
        activity_score: Number.isFinite(repo?.activity_score) ? repo.activity_score : 0,
      })),
      activity: {
        overall_score: Number.isFinite(githubData?.activity?.overall_score) ? githubData.activity.overall_score : 0,
      },
    };
  }

  normalizeSkillValidation(skillValidation) {
    return {
      verified: Array.isArray(skillValidation?.verified)
        ? skillValidation.verified
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              skill: typeof item.skill === "string" ? item.skill.trim() : "",
              evidence: typeof item.evidence === "string" ? item.evidence.trim() : "",
            }))
            .filter((item) => item.skill && item.evidence)
        : [],
      missing: Array.isArray(skillValidation?.missing)
        ? skillValidation.missing.filter((skill) => typeof skill === "string").map((skill) => skill.trim()).filter(Boolean)
        : [],
    };
  }

  normalizeStringList(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  }

  normalizeEvaluation(evaluation, input) {
    return {
      score: this.clampScore(evaluation?.score ?? input.base_score),
      verified_skills: Array.isArray(evaluation?.verified_skills)
        ? evaluation.verified_skills
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              skill: typeof item.skill === "string" ? item.skill.trim() : "",
              evidence: typeof item.evidence === "string" ? item.evidence.trim() : "",
            }))
            .filter((item) => item.skill && this.isVerifiedSkill(item.skill, input.skillValidation.verified))
            .map((item) => ({
              skill: item.skill,
              evidence: item.evidence || this.getVerifiedSkillEvidence(item.skill, input.skillValidation.verified),
            }))
        : input.skillValidation.verified,
      suspicious_claims: Array.isArray(evaluation?.suspicious_claims)
        ? evaluation.suspicious_claims
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
              skill: typeof item.skill === "string" ? item.skill.trim() : "",
              reason: typeof item.reason === "string" ? item.reason.trim() : "",
            }))
            .filter((item) => item.skill && item.reason)
        : [],
      summary: typeof evaluation?.summary === "string" ? evaluation.summary.trim() : "",
      decision: this.normalizeDecision(evaluation?.decision),
      confidence: this.normalizeConfidence(evaluation?.confidence),
      strengths: this.normalizeStringList(evaluation?.strengths),
      weaknesses: this.normalizeStringList(evaluation?.weaknesses),
    };
  }

  calculateBaseScore(githubData, skillValidation) {
    const verifiedCount = skillValidation?.verified?.length ?? 0;
    const missingCount = skillValidation?.missing?.length ?? 0;
    const repoCount = githubData?.repo_count ?? 0;
    const hasRecentActivity = this.hasRecentGithubActivity(githubData?.repos ?? []);

    let score = 50;
    score += Math.min(verifiedCount * 10, 30);
    score -= Math.min(missingCount * 10, 30);

    if (repoCount > 5) {
      score += 10;
    }

    if (hasRecentActivity) {
      score += 10;
    }

    return this.clampScore(score);
  }

  hasRecentGithubActivity(repos) {
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return repos.some((repo) => {
      if (typeof repo?.last_updated !== "string" || !repo.last_updated) {
        return false;
      }

      const updatedAt = new Date(repo.last_updated);

      if (Number.isNaN(updatedAt.getTime())) {
        return false;
      }

      return now - updatedAt.getTime() <= ninetyDaysInMs;
    });
  }

  clampScore(score) {
    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  normalizeDecision(decision) {
    if (decision === "Hire" || decision === "Reject" || decision === "Maybe") {
      return decision;
    }

    return "Maybe";
  }

  normalizeConfidence(confidence) {
    if (confidence === "Low" || confidence === "Medium" || confidence === "High") {
      return confidence;
    }

    return "Medium";
  }

  isVerifiedSkill(skill, verifiedSkills) {
    return verifiedSkills.some((item) => item.skill === skill);
  }

  getVerifiedSkillEvidence(skill, verifiedSkills) {
    return verifiedSkills.find((item) => item.skill === skill)?.evidence ?? "";
  }

  buildEvaluationPrompt({ resumeData, githubData, skillValidation, base_score }) {
    return `You are a senior technical recruiter.

Evaluate a candidate ONLY using the provided data.

DO NOT guess or assume anything not present.

Scoring guidelines:
- Strong alignment (verified skills + active GitHub) -> 80-100
- Partial alignment -> 50-79
- Weak alignment -> below 50

Return ONLY JSON:

{
  "score": number,
  "verified_skills": [
    {
      "skill": "",
      "evidence": ""
    }
  ],
  "suspicious_claims": [
    {
      "skill": "",
      "reason": ""
    }
  ],
  "strengths": ["", ""],
  "weaknesses": ["", ""],
  "summary": "",
  "decision": "Hire / Reject / Maybe",
  "confidence": "Low | Medium | High"
}

Data:
Resume: ${JSON.stringify(resumeData)}
GitHub: ${JSON.stringify(githubData)}
SkillValidation: ${JSON.stringify(skillValidation)}
BaseScore: ${base_score}`;
  }

  createFallbackEvaluation(input, cause = "") {
    const verified = input.skillValidation.verified ?? [];
    const missing = input.skillValidation.missing ?? [];
    const score = this.clampScore(input.base_score);

    return {
      score,
      verified_skills: verified,
      suspicious_claims: missing.slice(0, 5).map((skill) => ({
        skill,
        reason: "This skill appears on the resume, but matching GitHub evidence was not found in the available repository data.",
      })),
      strengths: verified.length
        ? [`Verified ${verified.length} skill claim${verified.length === 1 ? "" : "s"} from GitHub signals.`]
        : ["Resume was processed, but direct GitHub skill evidence was limited."],
      weaknesses: missing.length
        ? [`${missing.length} claimed skill${missing.length === 1 ? "" : "s"} need stronger evidence or clearer project context.`]
        : ["Add measurable project outcomes to strengthen the credibility report."],
      summary: cause
        ? `Local fallback evaluation was used because the AI provider was unavailable. The score is based on resume skills and GitHub evidence only.`
        : "Local fallback evaluation based on resume skills and GitHub evidence.",
      decision: score >= 80 ? "Hire" : score >= 45 ? "Maybe" : "Reject",
      confidence: verified.length || missing.length ? "Medium" : "Low",
    };
  }
}

export const aiEvaluatorService = new AiEvaluatorService();
