import { z } from "zod";

/** Shared by the client form and the /api/contact handler. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  message: z.string().trim().min(10, "Tell us a little more").max(5000),
  /** Honeypot: must stay empty. */
  _hp: z.string().max(0, "Spam detected").optional().default(""),
  /** Timing token rendered into the form. */
  _t: z.string().min(1),
  /** Path of the page the form was submitted from. */
  page: z.string().max(500).optional(),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactValues = z.output<typeof contactSchema>;
