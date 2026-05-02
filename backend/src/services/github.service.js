import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

class GithubService {
  constructor() {
    this.baseUrl = "https://api.github.com";
  }

  async getGithubProfile(username) {
    if (!username?.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "GitHub username is required");
    }

    const normalizedUsername = username.trim();
    const repositories = await this.getUserRepositories(normalizedUsername);
    const repos = await Promise.all(
      repositories.map(async (repository) => {
        const languages = await this.getRepositoryLanguages(normalizedUsername, repository.name);
        return this.mapRepositorySummary(repository, languages);
      }),
    );

    return {
      username: normalizedUsername,
      repo_count: repos.length,
      repos,
      top_languages: this.getTopLanguages(repos),
    };
  }

  async getCandidateSnapshot(githubUsername) {
    const profile = await this.getGithubProfile(githubUsername);

    return {
      username: profile.username,
      profileSummary: null,
      repo_count: profile.repo_count,
      repositories: profile.repos,
      top_languages: profile.top_languages,
      activity: {
        overall_score: this.calculateOverallActivityScore(profile.repos),
      },
      collectedAt: new Date().toISOString(),
    };
  }

  async getUserRepositories(username) {
    const response = await this.requestGithub(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
    return Array.isArray(response) ? response : [];
  }

  async getRepositoryLanguages(username, repositoryName) {
    const response = await this.requestGithub(
      `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repositoryName)}/languages`,
    );

    return Object.keys(response ?? {});
  }

  async requestGithub(path) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: this.buildHeaders(),
    });

    if (response.status === StatusCodes.NOT_FOUND) {
      throw new ApiError(StatusCodes.NOT_FOUND, "GitHub user not found");
    }

    if (response.status === StatusCodes.FORBIDDEN && response.headers.get("x-ratelimit-remaining") === "0") {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, "GitHub API rate limit exceeded");
    }

    if (!response.ok) {
      const errorBody = await this.safeReadJson(response);

      throw new ApiError(StatusCodes.BAD_GATEWAY, "GitHub API request failed", {
        status: response.status,
        message: errorBody?.message ?? "Unknown GitHub API error",
      });
    }

    return response.json();
  }

  buildHeaders() {
    return {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.githubToken}`,
      "User-Agent": "ai-resume-truth-checker",
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  async safeReadJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  mapRepositorySummary(repository, languages) {
    return {
      name: repository.name ?? "",
      languages,
      stars: repository.stargazers_count ?? 0,
      forks: repository.forks_count ?? 0,
      last_updated: repository.updated_at ?? "",
      activity_score: this.calculateRepositoryActivityScore({
        stars: repository.stargazers_count ?? 0,
        forks: repository.forks_count ?? 0,
        lastUpdated: repository.updated_at,
      }),
    };
  }

  calculateRepositoryActivityScore({ stars, forks, lastUpdated }) {
    const starScore = Math.min(stars * 5, 40);
    const forkScore = Math.min(forks * 3, 20);
    const recencyScore = this.calculateRecencyScore(lastUpdated);

    return Math.min(100, starScore + forkScore + recencyScore);
  }

  calculateRecencyScore(lastUpdated) {
    if (!lastUpdated) {
      return 0;
    }

    const updatedAt = new Date(lastUpdated);

    if (Number.isNaN(updatedAt.getTime())) {
      return 0;
    }

    const ageInDays = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

    if (ageInDays <= 30) {
      return 40;
    }

    if (ageInDays <= 90) {
      return 30;
    }

    if (ageInDays <= 180) {
      return 20;
    }

    if (ageInDays <= 365) {
      return 10;
    }

    return 0;
  }

  calculateOverallActivityScore(repos) {
    if (!repos.length) {
      return 0;
    }

    const averageRepoScore =
      repos.reduce((total, repository) => total + (repository.activity_score ?? 0), 0) / repos.length;
    const repoCountBonus = Math.min(repos.length * 2, 20);

    return Math.round(Math.min(100, averageRepoScore + repoCountBonus));
  }

  getTopLanguages(repos) {
    const languageCounts = new Map();

    for (const repo of repos) {
      for (const language of repo.languages ?? []) {
        const normalizedLanguage = this.normalizeLanguageName(language);

        if (!normalizedLanguage) {
          continue;
        }

        languageCounts.set(normalizedLanguage, (languageCounts.get(normalizedLanguage) ?? 0) + 1);
      }
    }

    return [...languageCounts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 10)
      .map(([language]) => language);
  }

  mapGithubSkillsToResume(skills, githubData) {
    const resumeSkills = Array.isArray(skills) ? skills : [];
    const languageEvidenceMap = this.buildLanguageEvidenceMap(githubData);

    const verified = [];
    const missing = [];

    for (const skill of resumeSkills) {
      if (typeof skill !== "string") {
        continue;
      }

      const trimmedSkill = skill.trim();

      if (!trimmedSkill) {
        continue;
      }

      const comparableSkill = this.normalizeSkillForComparison(trimmedSkill);

      if (comparableSkill && languageEvidenceMap.has(comparableSkill)) {
        verified.push({
          skill: trimmedSkill,
          evidence: this.buildSkillEvidence(trimmedSkill, languageEvidenceMap.get(comparableSkill)),
        });
        continue;
      }

      missing.push(trimmedSkill);
    }

    return {
      verified,
      missing,
    };
  }

  buildLanguageEvidenceMap(githubData) {
    const repositories = Array.isArray(githubData?.repos)
      ? githubData.repos
      : Array.isArray(githubData?.repositories)
        ? githubData.repositories
        : [];
    const evidenceMap = new Map();

    for (const repository of repositories) {
      const repositoryName = typeof repository?.name === "string" ? repository.name.trim() : "";
      const languages = Array.isArray(repository?.languages) ? repository.languages : [];

      for (const language of languages) {
        const comparableLanguage = this.normalizeSkillForComparison(language);

        if (!comparableLanguage) {
          continue;
        }

        const currentEvidence = evidenceMap.get(comparableLanguage) ?? {
          matchedLanguages: new Set(),
          repositories: [],
        };

        const normalizedLanguage = this.normalizeLanguageName(language);
        if (normalizedLanguage) {
          currentEvidence.matchedLanguages.add(normalizedLanguage);
        }

        if (repositoryName && !currentEvidence.repositories.includes(repositoryName)) {
          currentEvidence.repositories.push(repositoryName);
        }

        evidenceMap.set(comparableLanguage, currentEvidence);
      }
    }

    return evidenceMap;
  }

  buildSkillEvidence(skill, evidence) {
    if (!evidence) {
      return `Matched ${skill} from GitHub language usage.`;
    }

    const repositoryCount = evidence.repositories.length;
    const repositoryPreview = evidence.repositories.slice(0, 3).join(", ");
    const repositoryLabel = repositoryCount === 1 ? "repository" : "repositories";
    const languageLabel = [...evidence.matchedLanguages].join(", ");

    if (!repositoryCount) {
      return `Matched ${skill} to GitHub language usage${languageLabel ? ` in ${languageLabel}` : ""}.`;
    }

    return `Used in ${repositoryCount} ${repositoryLabel}${repositoryPreview ? ` including ${repositoryPreview}` : ""}${
      languageLabel ? ` via ${languageLabel}` : ""
    }.`;
  }

  extractGithubLanguages(githubData) {
    if (Array.isArray(githubData?.top_languages)) {
      return githubData.top_languages;
    }

    if (Array.isArray(githubData?.repos)) {
      return githubData.repos.flatMap((repo) => (Array.isArray(repo?.languages) ? repo.languages : []));
    }

    if (Array.isArray(githubData?.repositories)) {
      return githubData.repositories.flatMap((repo) => (Array.isArray(repo?.languages) ? repo.languages : []));
    }

    return [];
  }

  normalizeLanguageName(language) {
    if (typeof language !== "string") {
      return "";
    }

    const normalized = language.trim().toLowerCase();

    if (!normalized) {
      return "";
    }

    const aliases = {
      js: "JavaScript",
      javascript: "JavaScript",
      ts: "TypeScript",
      typescript: "TypeScript",
      py: "Python",
      python: "Python",
      cpp: "C++",
      "c++": "C++",
      csharp: "C#",
      "c#": "C#",
      golang: "Go",
      go: "Go",
      rb: "Ruby",
      ruby: "Ruby",
      yml: "YAML",
      yaml: "YAML",
      md: "Markdown",
      shell: "Shell",
      sh: "Shell",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      sass: "Sass",
      java: "Java",
      kotlin: "Kotlin",
      swift: "Swift",
      php: "PHP",
      rust: "Rust",
      scala: "Scala",
      dart: "Dart",
    };

    return aliases[normalized] ?? this.toTitleCase(normalized);
  }

  normalizeSkillForComparison(skill) {
    const normalized = this.normalizeLanguageName(skill).toLowerCase();

    if (!normalized) {
      return "";
    }

    const skillAliases = {
      react: "javascript",
      "react.js": "javascript",
      reactjs: "javascript",
      next: "javascript",
      "next.js": "javascript",
      nextjs: "javascript",
      node: "javascript",
      "node.js": "javascript",
      nodejs: "javascript",
      express: "javascript",
      "express.js": "javascript",
      expressjs: "javascript",
      vue: "javascript",
      "vue.js": "javascript",
      vuejs: "javascript",
      angular: "typescript",
      nest: "typescript",
      "nest.js": "typescript",
      nestjs: "typescript",
      django: "python",
      flask: "python",
      fastapi: "python",
      pandas: "python",
      numpy: "python",
      spring: "java",
      "spring boot": "java",
      laravel: "php",
      rails: "ruby",
      "asp.net": "c#",
      dotnet: "c#",
      ".net": "c#",
    };

    return skillAliases[skill.trim().toLowerCase()] ?? normalized;
  }

  toTitleCase(value) {
    return value.replace(/\b[a-z]/g, (character) => character.toUpperCase());
  }
}

export const githubService = new GithubService();
