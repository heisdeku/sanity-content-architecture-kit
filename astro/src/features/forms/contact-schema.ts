import { z } from 'zod';

/** Shared by the client island and /api/contact. Keep it the single source. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.email('Please enter a valid email address').trim().max(200),
  message: z.string().trim().min(10, 'Tell us a little more').max(5000),
  /** Honeypot: humans never fill it. */
  _hp: z.string().max(0, 'Spam detected').optional().default(''),
  /** Timing token issued at render time. */
  _t: z.string().min(1, 'Missing form token'),
  /** Path of the page the form was submitted from. */
  page: z.string().max(500).optional().default('/'),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactValues = z.output<typeof contactSchema>;
