import { StatusCodes } from "http-status-codes";

import { extensionService } from "../services/extension.service.js";
import { ApiError } from "../utils/api-error.js";
import {
  extensionEventSchema,
  generateCoverLetterSchema,
  saveCoverLetterSchema,
} from "../validators/extension.validator.js";

const parseOrThrow = (schema, data) => {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Validation failed", parsed.error.flatten());
  }

  return parsed.data;
};

export const getExtensionUsage = async (request, response) => {
  const usage = await extensionService.getUsage(request.user);

  response.status(StatusCodes.OK).json({
    success: true,
    data: usage,
  });
};

export const generateExtensionCoverLetter = async (request, response) => {
  const payload = parseOrThrow(generateCoverLetterSchema, request.body);
  const result = await extensionService.generateCoverLetter({
    user: request.user,
    job: payload.job,
  });

  response.status(StatusCodes.CREATED).json({
    success: true,
    data: result,
  });
};

export const saveExtensionCoverLetter = async (request, response) => {
  const payload = parseOrThrow(saveCoverLetterSchema, request.body);
  const result = await extensionService.saveCoverLetter({
    user: request.user,
    job: payload.job,
    subjectLine: payload.subjectLine,
    content: payload.content,
    callToAction: payload.callToAction,
  });

  response.status(StatusCodes.CREATED).json({
    success: true,
    data: result,
  });
};

export const trackExtensionEvent = (request, response) => {
  const payload = parseOrThrow(extensionEventSchema, request.body);
  extensionService.trackEvent({
    user: request.user,
    event: payload.event,
    properties: payload.properties,
    occurredAt: payload.occurredAt,
  });

  response.status(StatusCodes.OK).json({ success: true });
};
