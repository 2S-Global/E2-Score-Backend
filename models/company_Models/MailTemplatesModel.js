import mongoose from "mongoose";

const CompanyMailTemplatesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MailTemplate",
      required: true,
    },
    templateName: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

CompanyMailTemplatesSchema.index(
  { userId: 1, templateId: 1 },
  { unique: true },
);

export const CompanyMailTemplate = mongoose.model(
  "CompanyMailTemplate",
  CompanyMailTemplatesSchema,
);

const MailTemplatesSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
export const MailTemplate = mongoose.model("MailTemplate", MailTemplatesSchema);
