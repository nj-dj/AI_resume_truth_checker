import mongoose from "mongoose";

const jobSnapshotSchema = new mongoose.Schema(
  {
    site: { type: String, default: "unknown" },
    url: { type: String, default: "" },
    title: { type: String, default: "" },
    companyName: { type: String, default: "" },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    extractedAt: { type: String, default: "" },
  },
  { _id: false },
);

const savedCoverLetterSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    job: { type: jobSnapshotSchema, default: () => ({}) },
    subjectLine: { type: String, default: "" },
    bodyMarkdown: { type: String, required: true },
    callToAction: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SavedCoverLetter = mongoose.model("SavedCoverLetter", savedCoverLetterSchema);
