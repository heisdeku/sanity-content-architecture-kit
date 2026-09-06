import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Honeypot } from '@/features/spam-prevention/honeypot';
import { track } from '@/features/umami/track';
import { type ContactInput, type ContactValues, contactSchema } from './contact-schema';
import { Form } from './form';

type ContactFormProps = {
  /** Timing token created server-side at render time. */
  token: string;
  /** Path of the page hosting the form, stored on the submission. */
  page: string;
  action?: string;
  submitLabel?: string;
  successMessage?: string;
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * React island (client:visible). react-hook-form + zod on the client, the same
 * schema validates again in /api/contact.
 */
export function ContactForm({
  token,
  page,
  action = '/api/contact',
  submitLabel = 'Send message',
  successMessage = 'Thanks, your message is on its way.',
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { _t: token, _hp: '', page },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus('submitting');
    setServerError(null);
    try {
      const response = await fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          hint?: string;
        } | null;
        setServerError(body?.hint ?? body?.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
      track('contact-form-submit', { page });
      reset({ _t: token, _hp: '', page, name: '', email: '', message: '' });
    } catch {
      setServerError('Network error. Please try again.');
      setStatus('error');
    }
  });

  return (
    <Form.Root onSubmit={onSubmit}>
      <input type="hidden" {...register('_t')} />
      <input type="hidden" {...register('page')} />
      <Honeypot {...register('_hp')} />
      <Form.Field error={errors.name?.message}>
        <Form.Label>Name</Form.Label>
        <Form.Input autoComplete="name" {...register('name')} />
        <Form.Message />
      </Form.Field>
      <Form.Field error={errors.email?.message}>
        <Form.Label>Email</Form.Label>
        <Form.Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        <Form.Message />
      </Form.Field>
      <Form.Field error={errors.message?.message}>
        <Form.Label>Message</Form.Label>
        <Form.Textarea {...register('message')} />
        <Form.Message />
      </Form.Field>
      <div className="flex items-center gap-4">
        <Form.Submit disabled={isSubmitting || status === 'submitting'}>
          {status === 'submitting' ? 'Sending' : submitLabel}
        </Form.Submit>
        <Form.Status state={status}>
          {status === 'success' ? successMessage : status === 'error' ? serverError : null}
        </Form.Status>
      </div>
    </Form.Root>
  );
}
