import { z } from "zod";

export const submitMentalTestValidation = z.object({
  answers: z
    .array(
      z.object({
        questionId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID"),

        selectedOption: z
          .string()
          .min(1, "Selected option is required"),
      })
    )
    .min(1, "At least one answer is required"),
});