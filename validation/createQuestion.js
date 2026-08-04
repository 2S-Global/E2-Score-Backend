import { z } from "zod";

export const createQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required"),

  options: z
    .array(
      z.string().trim().min(1, "Option cannot be empty")
    )
    .min(2, "At least 2 options are required"),

  correctOption: z
    .string()
    .trim()
    .min(1, "Correct option is required"),
});