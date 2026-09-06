import "server-only";
import { Resend } from "resend";
import { env } from "@/env";
import type { SubmissionSink } from "@/features/forms/submit-contact";
import { writeClient } from "@/features/sanity/client";
import { getPublishedSite } from "@/features/site/get-site";

/**
 * Stores a `submission` document with the edit token, then emails the
 * recipients configured on the Site document through Resend. A missing
 * RESEND_API_KEY skips the email and logs; the submission is still stored.
 */
export const submissionSink: SubmissionSink = async (values, { userAgent }) => {
  if (!env.SANITY_API_EDIT_TOKEN) {
    throw new Error("SANITY_API_EDIT_TOKEN is required to store submissions");
  }

  const receivedAt = new Date().toISOString();
  await writeClient.create({
    _type: "submission",
    name: values.name,
    email: values.email,
    message: values.message,
    page: values.page ?? null,
    userAgent: userAgent ?? null,
    receivedAt,
  });

  const site = await getPublishedSite();
  const recipients = (site?.notifications?.recipients ?? []).filter(
    (r): r is string => typeof r === "string",
  );
  const from = site?.notifications?.fromAddress || env.RESEND_FROM;

  if (!env.RESEND_API_KEY || recipients.length === 0 || !from) {
    console.info("[contact] stored submission; email skipped", {
      hasKey: Boolean(env.RESEND_API_KEY),
      recipients: recipients.length,
      from: Boolean(from),
    });
    return;
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to: recipients,
    replyTo: values.email,
    subject: `New message from ${values.name}`,
    text: [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Page: ${values.page ?? "unknown"}`,
      "",
      values.message,
    ].join("\n"),
  });
  if (error) console.error("[contact] email failed", error);
};
