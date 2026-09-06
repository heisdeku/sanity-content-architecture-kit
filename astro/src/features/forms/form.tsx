import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useContext,
  useId,
} from 'react';
import { cn } from '@/features/style/cn';

/**
 * Compound form primitives. Field wires label, control and message together
 * through context so consumers compose markup instead of passing booleans.
 */
type FieldContextValue = { id: string; errorId: string; error?: string | undefined };
const FieldContext = createContext<FieldContextValue | null>(null);

function useField(): FieldContextValue {
  const value = useContext(FieldContext);
  if (!value) throw new Error('Form.Label/Control/Message must be used inside Form.Field');
  return value;
}

function Root({ className, ...props }: ComponentPropsWithoutRef<'form'>) {
  return <form noValidate className={cn('grid gap-5', className)} {...props} />;
}

function Field({
  error,
  className,
  children,
}: {
  error?: string | undefined;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <FieldContext.Provider value={{ id, errorId: `${id}-error`, error }}>
      <div className={cn('grid gap-1.5', className)}>{children}</div>
    </FieldContext.Provider>
  );
}

function Label({ className, children, ...props }: ComponentPropsWithoutRef<'label'>) {
  const { id } = useField();
  return (
    <label htmlFor={id} className={cn('text-sm font-medium', className)} {...props}>
      {children}
    </label>
  );
}

const controlClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none transition-colors focus-visible:border-accent aria-invalid:border-red-500';

function Input({ className, ...props }: ComponentPropsWithoutRef<'input'>) {
  const { id, errorId, error } = useField();
  return (
    <input
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      className={cn(controlClass, className)}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: ComponentPropsWithoutRef<'textarea'>) {
  const { id, errorId, error } = useField();
  return (
    <textarea
      id={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      className={cn(controlClass, 'min-h-32 resize-y', className)}
      {...props}
    />
  );
}

function Message({ className }: { className?: string }) {
  const { errorId, error } = useField();
  if (!error) return null;
  return (
    <p
      id={errorId}
      role="alert"
      className={cn('text-sm text-red-600 dark:text-red-400', className)}
    >
      {error}
    </p>
  );
}

function Status({
  state,
  children,
  className,
}: {
  state: 'idle' | 'submitting' | 'success' | 'error';
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p
      aria-live="polite"
      className={cn('min-h-6 text-sm', state === 'error' && 'text-red-600', className)}
    >
      {children}
    </p>
  );
}

function Submit({ className, children, ...props }: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="submit"
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const Form = { Root, Field, Label, Input, Textarea, Message, Status, Submit };
