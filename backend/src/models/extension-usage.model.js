import mongoose from "mongoose";

const extensionUsageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    plan: { type: String, enum: ["free", "monthly", "yearly"], default: "free" },
    trialLimit: { type: Number, default: 5 },
    trialUsed: { type: Number, default: 0 },
    subscriptionStatus: {
      type: String,
      enum: ["trialing", "active", "past_due", "canceled", "none"],
      default: "none",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ExtensionUsage = mongoose.model("ExtensionUsage", extensionUsageSchema);
