import { StatusCodes } from "http-status-codes";

import { atsScannerService } from "../services/career/ats-scanner.service.js";
import { careerInsightsService } from "../services/career/career-insights.service.js";
import { coverLetterService } from "../services/career/cover-letter.service.js";
import { interviewPrepService } from "../services/career/interview-prep.service.js";
import { jobRecommendationService } from "../services/career/job-recommendation.service.js";
import { portfolioGeneratorService } from "../services/career/portfolio-generator.service.js";
import { resumeEnhancerService } from "../services/career/resume-enhancer.service.js";
import { ApiError } from "../utils/api-error.js";
import {
  atsScanSchema,
  atsScanTextSchema,
  careerInsightsSchema,
  coverLetterSchema,
  interviewFeedbackSchema,
  interviewSessionSchema,
  jobRecommendationsSchema,
  portfolioProfileSchema,
  resumeEnhanceSchema,
  resumeEnhanceTextSchema,
} from "../validators/career.validator.js";

const parseOrThrow = (schema, data) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", parsed.error.flatten());
  }

  return parsed.data;
};

export const postAtsScan = async (request, response) => {
  if (!request.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Resume file is required");
  }
  const body = parseOrThrow(atsScanSchema, request.body);
  const result = await atsScannerService.scanFromFile({
    file: request.file,
    jobDescription: body.jobDescription,
  });
  response.status(StatusCodes.CREATED).json(result);
};

export const postAtsScanText = async (request, response) => {
  const body = parseOrThrow(atsScanTextSchema, request.body);
  const result = await atsScannerService.scanFromText(body);
  response.status(StatusCodes.CREATED).json(result);
};

export const postResumeEnhanceUpload = async (request, response) => {
  if (!request.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Resume file is required");
  }
  const body = parseOrThrow(resumeEnhanceSchema, request.body);
  const result = await resumeEnhancerService.enhanceFromFile({
    file: request.file,
    jobDescription: body.jobDescription,
    focus: body.focus,
  });
  response.status(StatusCodes.CREATED).json(result);
};

export const postResumeEnhanceText = async (request, response) => {
  const body = parseOrThrow(resumeEnhanceTextSchema, request.body);
  const result = await resumeEnhancerService.enhanceFromText(body);
  response.status(StatusCodes.CREATED).json(result);
};

export const postCoverLetter = async (request, response) => {
  const body = parseOrThrow(coverLetterSchema, request.body);
  const result = await coverLetterService.generate(body);
  response.status(StatusCodes.CREATED).json(result);
};

export const postCareerInsights = async (request, response) => {
  const body = parseOrThrow(careerInsightsSchema, request.body);
  const result = await careerInsightsService.analyze(body);
  response.status(StatusCodes.CREATED).json(result);
};

export const postJobRecommendations = async (request, response) => {
  const body = parseOrThrow(jobRecommendationsSchema, request.body);
  const result = jobRecommendationService.recommend(body);
  response.status(StatusCodes.OK).json(result);
};

export const postPortfolioHtml = async (request, response) => {
  const body = parseOrThrow(portfolioProfileSchema, request.body);
  const html = portfolioGeneratorService.buildHtml(body);
  response.status(StatusCodes.OK).json({
    success: true,
    data: { html },
  });
};

export const postInterviewSession = async (request, response) => {
  const body = parseOrThrow(interviewSessionSchema, request.body);
  const result = await interviewPrepService.generateSession(body);
  response.status(StatusCodes.CREATED).json(result);
};

export const postInterviewFeedback = async (request, response) => {
  const body = parseOrThrow(interviewFeedbackSchema, request.body);
  const result = await interviewPrepService.feedbackOnAnswer(body);
  response.status(StatusCodes.CREATED).json(result);
};
