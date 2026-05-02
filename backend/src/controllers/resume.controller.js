import { StatusCodes } from "http-status-codes";

import { resumeAnalysisService } from "../services/resume-analysis.service.js";

export const createResumeAnalysis = async (request, response) => {
  const result = await resumeAnalysisService.analyze({
    file: request.file,
    body: request.body,
  });

  response.status(StatusCodes.CREATED).json(result);
};
