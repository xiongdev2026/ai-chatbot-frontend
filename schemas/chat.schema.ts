import { z } from "zod";

export const chatSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message is too long"),
});

export type ChatFormData = z.infer<typeof chatSchema>;