import { z } from "zod";

export const createQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required"),

  options: z
    .array(
      z.object({
        text: z
          .string()
          .trim()
          .min(1, "Option cannot be empty"),

        trait: z.enum(["D", "I", "S", "C"])
      })
    )
    .min(2, "At least 2 options are required")
});