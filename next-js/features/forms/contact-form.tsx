"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  type ContactInput,
  type ContactValues,
  contactSchema,
} from "@/features/forms/contact-schema";
import { Form } from "@/features/forms/form-primitives";
import { Honeypot } from "@/features/spam-prevention/honeypot";
import { track } from "@/features/umami/track";

type ContactFormProps = {
  /** Timing token created on the server at render time. */
  timingToken: string;
  submitLabel?: string;
  successMessage?: string;
};

type Status =
  | { state: "idle" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function ContactForm({
  timingToken,
  submitLabel = "Send message",
  successMessage = "Thanks, we will be in touch.",
}: ContactFormProps) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { _t: timingToken, _hp: "", page: pathname },
  });

  async function onSubmit(values: ContactValues) {
    setStatus({ state: "idle" });
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    if (response.ok) {
      reset({
        _t: timingToken,
        _hp: "",
        page: pathname,
        name: "",
        email: "",
        message: "",
      });
      setStatus({ state: "success", message: successMessage });
      track("contact-submit", { page: pathname });
      return;
    }
    const body = (await response.json().catch(() => null)) as {
      error?: string;
      hint?: string;
    } | null;
    setStatus({
      state: "error",
      message:
        body?.hint ?? body?.error ?? "Something went wrong. Please try again.",
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="relative flex flex-col gap-5"
    >
      <input type="hidden" {...register("_t")} />
      <input type="hidden" {...register("page")} />
      <Honeypot {...register("_hp")} />

      <Form.Field error={errors.name?.message}>
        <Form.Label>Name</Form.Label>
        <Form.Control autoComplete="name" {...register("name")} />
        <Form.Error />
      </Form.Field>

      <Form.Field error={errors.email?.message}>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        <Form.Error />
      </Form.Field>

      <Form.Field error={errors.message?.message}>
        <Form.Label>Message</Form.Label>
        <Form.Control as="textarea" {...register("message")} />
        <Form.Error />
      </Form.Field>

      <div className="flex items-center gap-4">
        <Form.Submit pending={isSubmitting}>
          {isSubmitting ? "Sending" : submitLabel}
        </Form.Submit>
        {status.state !== "idle" ? (
          <Form.Status tone={status.state}>{status.message}</Form.Status>
        ) : (
          <Form.Status>
            <span className="sr-only">Fill in the form to send a message.</span>
          </Form.Status>
        )}
      </div>
    </form>
  );
}
