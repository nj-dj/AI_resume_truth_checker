import multer from "multer";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

const storage = multer.memoryStorage();

const fileFilter = (_request, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(new ApiError(StatusCodes.BAD_REQUEST, "Unsupported resume file type"));
    return;
  }

  callback(null, true);
};

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeBytes,
  },
  fileFilter,
});
