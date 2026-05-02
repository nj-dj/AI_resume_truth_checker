import { z } from "zod";

export const resumeAnalysisSchema = z.object({
  githubUsername: z.string().min(1, "githubUsername is required"),
});
