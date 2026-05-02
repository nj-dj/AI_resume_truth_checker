import { StatusCodes } from "http-status-codes";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { generateGeminiContent } from "../config/gemini.js";
import { isDatabaseConnected } from "../database/mongodb.js";
import { ResumeAnalysis } from "../models/resume-analysis.model.js";
import { resumeAnalysisSchema } from "../validators/resume.validator.js";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";
import { aiEvaluatorService } from "./ai-evaluator.service.js";
import { githubService } from "./github.service.js";

class ResumeAnalysisService {
  async analyze({ file, body }) {
    if (!file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Resume file is required");
    }

    const parsedPayload = resumeAnalysisSchema.safeParse(body);

    if (!parsedPayload.success) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid resume analysis payload", parsedPayload.error.flatten());
    }

    const payload = parsedPayload.data;
    logger.info("Starting resume analysis pipeline", {
      githubUsername: payload.githubUsername,
      fileName: file.originalname,
    });

    const resumeText = await this.executeStep("extract_resume_text", async () => this.extractResumeText(file), {
      fileName: file.originalname,
    });

    const parsedResume = await this.executeStep(
      "parse_resume_with_ai",
      async () => this.parseResumeWithAI(resumeText),
      {
        githubUsername: payload.githubUsername,
      },
    );

    const extractedProfile = this.mapParsedResumeToExtractedProfile(parsedResume);

    const githubProfile = await this.executeStep(
      "fetch_github_profile",
      async () => githubService.getGithubProfile(payload.githubUsername),
      {
        githubUsername: payload.githubUsername,
      },
    );

    const githubSnapshot = this.createGithubSnapshot(githubProfile);

    const skillValidation = await this.executeStep(
      "validate_skills",
      async () => githubService.mapGithubSkillsToResume(parsedResume.skills, githubProfile),
      {
        githubUsername: payload.githubUsername,
      },
    );

    const evaluation = await this.executeStep(
      "evaluate_candidate",
      async () => aiEvaluatorService.evaluateCandidate(parsedResume, githubProfile, skillValidation),
      {
        githubUsername: payload.githubUsername,
      },
    );

    await this.storeAnalysisResult({
      payload,
      file,
      resumeText,
      extractedProfile,
      githubSnapshot,
      parsedResume,
      skillValidation,
      evaluation,
    });

    logger.info("Resume analysis pipeline completed", {
      githubUsername: payload.githubUsername,
      score: evaluation.score,
      decision: evaluation.decision,
    });

    return {
      success: true,
      data: {
        score: evaluation.score,
        decision: evaluation.decision,
        verified_skills: evaluation.verified_skills,
        suspicious_claims: evaluation.suspicious_claims,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        summary: evaluation.summary,
      },
    };
  }

  async extractResumeText(file) {
    if (!file.buffer?.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Uploaded resume file is empty");
    }

    try {
      const rawText = await this.getRawResumeText(file);
      const cleanedText = this.cleanExtractedText(rawText);

      if (!cleanedText) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No readable text could be extracted from the resume");
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to extract text from the uploaded resume", {
        fileName: file.originalname,
        mimeType: file.mimetype,
        cause: error.message,
      });
    }
  }

  async getRawResumeText(file) {
    switch (file.mimetype) {
      case "application/pdf":
        return this.extractPdfText(file.buffer);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return this.extractDocxText(file.buffer);
      case "application/msword":
        return this.extractDocText(file.buffer);
      default:
        throw new ApiError(StatusCodes.BAD_REQUEST, "Unsupported resume file type");
    }
  }

  async extractPdfText(buffer) {
    try {
      const parsed = await pdfParse(buffer);
      return parsed.text ?? "";
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Unable to read PDF resume. The file may be corrupted.", {
        cause: error.message,
      });
    }
  }

  async extractDocxText(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? "";
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Unable to read DOCX resume. The file may be corrupted.", {
        cause: error.message,
      });
    }
  }

  async extractDocText(_buffer) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Legacy DOC files are not supported for text extraction yet. Please upload a PDF or DOCX file.",
    );
  }

  cleanExtractedText(text) {
    return text
      .replace(/\r/g, "\n")
      .replace(/\t+/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim();
  }

  async parseResumeWithAI(resumeText) {
    if (!resumeText?.trim()) {
      return this.createEmptyParsedResume();
    }

    try {
      const result = await generateGeminiContent({
        contents: this.buildResumeParsingPrompt(resumeText),
        config: {
          temperature: 0,
          responseMimeType: "application/json",
        },
        purpose: "resume_parsing",
      });
      const content = result.text;

      if (!content) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "Gemini returned an empty response for resume parsing");
      }

      const parsedJson = JSON.parse(this.extractJsonString(content));
      return this.normalizeParsedResume(parsedJson);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(StatusCodes.BAD_GATEWAY, "Failed to parse resume with Gemini", {
        cause: error.message,
      });
    }
  }

  buildResumeParsingPrompt(resumeText) {
    return `Extract structured JSON from this resume.

Return ONLY valid JSON.
Do not include markdown.
Do not add explanation.
If data is missing, return empty strings or empty arrays.
Use only information explicitly present in the resume.

Return ONLY JSON:
{
  "name": "",
  "skills": [],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "tech_stack": [],
      "description": ""
    }
  ],
  "education": []
}

Resume:
${resumeText}`;
  }

  extractJsonString(content) {
    const trimmed = content.trim();

    if (trimmed.startsWith("```")) {
      return trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
    }

    return trimmed;
  }

  getResumeJsonSchema() {
    return {
      type: "object",
      additionalProperties: false,
      required: ["name", "skills", "experience", "projects", "education"],
      properties: {
        name: {
          type: "string",
        },
        skills: {
          type: "array",
          items: {
            type: "string",
          },
        },
        experience: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["role", "company", "duration", "description"],
            properties: {
              role: { type: "string" },
              company: { type: "string" },
              duration: { type: "string" },
              description: { type: "string" },
            },
          },
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["name", "tech_stack", "description"],
            properties: {
              name: { type: "string" },
              tech_stack: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              description: { type: "string" },
            },
          },
        },
        education: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    };
  }

  createEmptyParsedResume() {
    return {
      name: "",
      skills: [],
      experience: [],
      projects: [],
      education: [],
    };
  }

  normalizeParsedResume(parsedResume) {
    const emptyResume = this.createEmptyParsedResume();

    if (!parsedResume || typeof parsedResume !== "object") {
      return emptyResume;
    }

    return {
      name: typeof parsedResume.name === "string" ? parsedResume.name.trim() : "",
      skills: Array.isArray(parsedResume.skills)
        ? parsedResume.skills.filter((skill) => typeof skill === "string").map((skill) => skill.trim()).filter(Boolean)
        : [],
      experience: Array.isArray(parsedResume.experience)
        ? parsedResume.experience.map((item) => ({
            role: typeof item?.role === "string" ? item.role.trim() : "",
            company: typeof item?.company === "string" ? item.company.trim() : "",
            duration: typeof item?.duration === "string" ? item.duration.trim() : "",
            description: typeof item?.description === "string" ? item.description.trim() : "",
          }))
        : [],
      projects: Array.isArray(parsedResume.projects)
        ? parsedResume.projects.map((item) => ({
            name: typeof item?.name === "string" ? item.name.trim() : "",
            tech_stack: Array.isArray(item?.tech_stack)
              ? item.tech_stack
                  .filter((tech) => typeof tech === "string")
                  .map((tech) => tech.trim())
                  .filter(Boolean)
              : [],
            description: typeof item?.description === "string" ? item.description.trim() : "",
          }))
        : [],
      education: Array.isArray(parsedResume.education)
        ? parsedResume.education
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };
  }

  mapParsedResumeToExtractedProfile(parsedResume) {
    return {
      fullName: parsedResume.name || null,
      email: null,
      phone: null,
      skills: parsedResume.skills,
      experienceYears: parsedResume.experience.length,
      projects: parsedResume.projects,
    };
  }

  createGithubSnapshot(githubProfile) {
    return {
      username: githubProfile.username,
      profileSummary: null,
      repo_count: githubProfile.repo_count,
      repositories: githubProfile.repos,
      top_languages: githubProfile.top_languages,
      activity: {
        overall_score: githubService.calculateOverallActivityScore(githubProfile.repos),
      },
      collectedAt: new Date().toISOString(),
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

  async storeAnalysisResult({ payload, file, resumeText, extractedProfile, githubSnapshot, parsedResume, skillValidation, evaluation }) {
    if (!isDatabaseConnected()) {
      logger.warn("Skipping analysis persistence because MongoDB is not connected", {
        githubUsername: payload.githubUsername,
      });
      return null;
    }

    return this.executeStep(
      "store_analysis_result",
      async () =>
        ResumeAnalysis.create({
          candidateEmail: extractedProfile.email ?? null,
          githubUsername: payload.githubUsername,
          resumeFileName: file.originalname,
          resumeMimeType: file.mimetype,
          resumeText,
          extractedProfile,
          githubSnapshot,
          evaluation: {
            parsedResume,
            skillValidation,
            score: evaluation.score,
            decision: evaluation.decision,
            verified_skills: evaluation.verified_skills,
            suspicious_claims: evaluation.suspicious_claims,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            summary: evaluation.summary,
            confidence: evaluation.confidence,
          },
          scoring: {
            overall: evaluation.score,
            consistency: this.calculateConsistencyScore(skillValidation),
            githubStrength: githubSnapshot.activity?.overall_score ?? 0,
            explanation: evaluation.summary,
          },
          status: "completed",
        }),
      {
        githubUsername: payload.githubUsername,
      },
    );
  }

  async executeStep(stepName, handler, meta = {}) {
    logger.info(`Pipeline step started: ${stepName}`, meta);

    try {
      const result = await handler();
      logger.info(`Pipeline step completed: ${stepName}`, meta);
      return result;
    } catch (error) {
      logger.error(`Pipeline step failed: ${stepName}`, {
        ...meta,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }
}

export const resumeAnalysisService = new ResumeAnalysisService();
