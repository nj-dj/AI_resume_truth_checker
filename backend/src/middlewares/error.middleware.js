import { StatusCodes } from "http-status-codes";
import multer from "multer";
import { ZodError } from "zod";

import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (error, _request, response, _next) => {
  logger.error("Unhandled application error", error);

  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof multer.MulterError) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }

  return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error",
  });
};
