import { z } from "zod";

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z
        .string({
            error: "Razorpay order ID is required",
        })
        .trim()
        .min(1, "Razorpay order ID is required"),

    razorpay_payment_id: z
        .string({
            error: "Razorpay payment ID is required",
        })
        .trim()
        .min(1, "Razorpay payment ID is required"),

    razorpay_signature: z
        .string({
            error: "Razorpay signature is required",
        })
        .trim()
        .min(1, "Razorpay signature is required"),

    type: z
        .enum(["CIBIL", "EXPERIAN"], {
            error: "Type must be either CIBIL or EXPERIAN",
        })
        .default("CIBIL"), //thats the issue
});