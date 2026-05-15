import { SEED_JOBS } from "./jobs.seed.js";

const normalize = (s) => String(s ?? "").toLowerCase().trim();

const skillOverlapScore = (jobSkills, candidateSkills) => {
  const cand = new Set(candidateSkills.map(normalize).filter(Boolean));
  if (!cand.size || !jobSkills.length) return 0;

  let hits = 0;
  for (const s of jobSkills) {
    if (cand.has(normalize(s))) hits += 1;
  }

  return Math.round((hits / jobSkills.length) * 100);
};

class JobRecommendationService {
  recommend({ skills = [], experienceYears = 0, location = "", workMode = "any" }) {
    const loc = normalize(location);
    const mode = normalize(workMode);

    const ranked = SEED_JOBS.map((job) => {
      const skillScore = skillOverlapScore(job.skills, skills);
      const titleBoost = skills.some((s) => normalize(job.title).includes(normalize(s))) ? 10 : 0;
      let locationScore = 40;

      if (loc) {
        locationScore = normalize(job.location).includes(loc) || normalize(job.location).includes("remote") ? 100 : 20;
      }

      let modeScore = 100;
      if (mode !== "any" && mode) {
        modeScore = normalize(job.workMode) === mode ? 100 : 40;
      }

      const experienceBoost = experienceYears >= 5 && /senior|lead|manager/i.test(job.title) ? 12 : 0;

      const matchScore = Math.min(
        100,
        Math.round(skillScore * 0.55 + locationScore * 0.2 + modeScore * 0.2 + titleBoost * 0.05 + experienceBoost),
      );

      return { ...job, matchScore, skillScore };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return {
      success: true,
      data: {
        jobs: ranked,
        filters: { skills, experienceYears, location, workMode },
      },
    };
  }
}

export const jobRecommendationService = new JobRecommendationService();
