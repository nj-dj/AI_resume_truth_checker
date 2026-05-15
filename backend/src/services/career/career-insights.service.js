import { generateStructuredJson } from "../ai/structured-json.js";

const TRENDING_SKILLS = [
  "Generative AI application design",
  "LLM prompt engineering & evaluation",
  "TypeScript at scale",
  "Cloud-native architecture (AWS/GCP)",
  "Data-informed product experimentation",
  "Security basics for web apps (OWASP)",
  "Observability (OpenTelemetry)",
  "Cross-functional stakeholder communication",
];

class CareerInsightsService {
  async analyze({ currentSkills = [], targetRole = "", experienceYears = 0, locationPreference = "" }) {
    const data = await generateStructuredJson({
      purpose: "career_insights",
      prompt: `You are a pragmatic career coach for tech and knowledge workers.

Return ONLY JSON:
{
  "skill_gaps": [{"skill": "", "why_it_matters": "", "learning_path": ""}],
  "roadmap_milestones": [{"title": "", "timeframe": "", "actions": [""]}],
  "salary_insights": {"summary": "", "confidence": "Low|Medium|High"},
  "learning_recommendations": [{"title": "", "resource_type": "course|book|practice", "notes": ""}]
}

Inputs:
- Current skills: ${JSON.stringify(currentSkills)}
- Target role: ${targetRole || "Not specified"}
- Approx years experience: ${experienceYears}
- Location preference: ${locationPreference || "Not specified"}

Skill gaps should be realistic for the target role. Salary insights must be clearly generic / non-binding (no fabricated numbers); prefer ranges by region only if confident, else explain uncertainty.
`,
    });

    return {
      success: true,
      data: {
        trendingSkills: TRENDING_SKILLS,
        skillGaps: Array.isArray(data.skill_gaps) ? data.skill_gaps : [],
        roadmapMilestones: Array.isArray(data.roadmap_milestones) ? data.roadmap_milestones : [],
        salaryInsights: data.salary_insights && typeof data.salary_insights === "object" ? data.salary_insights : { summary: "", confidence: "Low" },
        learningRecommendations: Array.isArray(data.learning_recommendations) ? data.learning_recommendations : [],
      },
    };
  }
}

export const careerInsightsService = new CareerInsightsService();
