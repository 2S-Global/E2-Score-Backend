import { z } from "zod";

export const submitMentalTestFeedbackValidation = z
    .array(
        z.object({
            questionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid question ID"),
            remarks: z.number().int().min(1).max(5),
            is_reversed: z.boolean().optional(),
        })
    )
    .min(1, "Feedback data is required");