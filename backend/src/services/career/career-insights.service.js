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
      fallbackData: this.buildFallbackInsights({ currentSkills, targetRole, experienceYears, locationPreference }),
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

  buildFallbackInsights({ currentSkills = [], targetRole = "", experienceYears = 0, locationPreference = "" }) {
    const role = targetRole || "your target role";
    const skills = currentSkills.length ? currentSkills.join(", ") : "your current skills";

    return {
      skill_gaps: [
        {
          skill: "Role-specific project evidence",
          why_it_matters: `Employers need to see how ${skills} translate into outcomes for ${role}.`,
          learning_path: "Create or document 2-3 projects with clear scope, decisions, and measurable results.",
        },
        {
          skill: "System design and trade-off communication",
          why_it_matters: "Senior candidates are expected to explain architecture decisions, constraints, and operational impact.",
          learning_path: "Practice writing short design notes that compare options and explain why one approach was chosen.",
        },
        {
          skill: "Interview storytelling",
          why_it_matters: "Strong answers connect responsibilities to impact and collaboration.",
          learning_path: "Prepare STAR-format examples for delivery, debugging, conflict, leadership, and learning.",
        },
      ],
      roadmap_milestones: [
        {
          title: "Strengthen evidence",
          timeframe: "0-4 weeks",
          actions: ["Update resume bullets with tools, scope, and outcomes.", "Add portfolio or GitHub notes for the strongest projects."],
        },
        {
          title: "Practice role alignment",
          timeframe: "1-2 months",
          actions: ["Map target job descriptions to your project evidence.", "Practice concise technical and behavioral answers."],
        },
        {
          title: "Apply and iterate",
          timeframe: "2-3 months",
          actions: ["Track applications and feedback.", "Refine keywords and examples based on recruiter responses."],
        },
      ],
      salary_insights: {
        summary: `Salary expectations for ${role} depend heavily on location, company size, interview performance, and proof of impact. Use ${locationPreference || "your preferred location"} as a market filter and validate ranges from current job postings.`,
        confidence: experienceYears >= 3 ? "Medium" : "Low",
      },
      learning_recommendations: [
        {
          title: "Build a role-aligned project case study",
          resource_type: "practice",
          notes: "Document problem, constraints, implementation, trade-offs, and outcome.",
        },
        {
          title: "Review current job descriptions",
          resource_type: "practice",
          notes: "Extract recurring skills and convert them into truthful resume language.",
        },
      ],
    };
  }
}

export const careerInsightsService = new CareerInsightsService();
