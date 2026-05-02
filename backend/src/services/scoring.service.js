import { aiEvaluatorService } from "./ai-evaluator.service.js";

class ScoringService {
  async evaluate({ roleTitle, extractedProfile, githubSnapshot, parsedResume, skillValidation }) {
    const evaluation = await aiEvaluatorService.evaluateCandidate(
      parsedResume ?? this.mapExtractedProfileToResumeData(extractedProfile),
      githubSnapshot,
      skillValidation ?? { verified: [], missing: [] },
    );

    return {
      scoring: {
        overall: evaluation.score,
        consistency: this.calculateConsistencyScore(skillValidation),
        githubStrength: githubSnapshot?.activity?.overall_score ?? 0,
        explanation: evaluation.summary || `Evaluation completed for ${roleTitle}`,
      },
      details: {
        extractedProfile,
        githubSnapshot,
        skillValidation,
        findings: evaluation.suspicious_claims,
        evaluation,
      },
    };
  }

  calculateConsistencyScore(skillValidation) {
    const verifiedCount = skillValidation?.verified?.length ?? 0;
    const missingCount = skillValidation?.missing?.length ?? 0;
    const total = verifiedCount + missingCount;

    if (!total) {
      return 0;
    }

    return Math.round((verifiedCount / total) * 100);
  }

  mapExtractedProfileToResumeData(extractedProfile) {
    return {
      name: extractedProfile?.fullName ?? "",
      skills: Array.isArray(extractedProfile?.skills) ? extractedProfile.skills : [],
      experience: [],
      projects: Array.isArray(extractedProfile?.projects) ? extractedProfile.projects : [],
      education: [],
    };
  }
}

export const scoringService = new ScoringService();
