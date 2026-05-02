import mongoose from "mongoose";

const extractedProfileSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false },
);

const scoringSchema = new mongoose.Schema(
  {
    overall: { type: Number, default: 0 },
    consistency: { type: Number, default: 0 },
    githubStrength: { type: Number, default: 0 },
    explanation: { type: String, default: "" },
  },
  { _id: false },
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    candidateEmail: { type: String, default: null, index: true },
    githubUsername: { type: String, required: true, index: true },
    resumeFileName: { type: String, required: true },
    resumeMimeType: { type: String, required: true },
    resumeText: { type: String, default: "" },
    extractedProfile: { type: extractedProfileSchema, default: () => ({}) },
    githubSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    evaluation: { type: mongoose.Schema.Types.Mixed, default: {} },
    scoring: { type: scoringSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "processing",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ResumeAnalysis = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
