"use client";

import { createContext, type ReactNode, useContext, useId } from "react";
import { cn } from "@/features/style/cn";

/**
 * Compound form primitives. A Field provides ids and error state through
 * context so Label, Control and Error compose without prop drilling.
 */
type FieldContextValue = { id: string; errorId: string; error?: string };

const FieldContext = createContext<FieldContextValue | null>(null);

function useField() {
  const ctx = useContext(FieldContext);
  if (!ctx)
    throw new Error(
      "Form.Label / Form.Control / Form.Error must live inside Form.Field",
    );
  return ctx;
}

type FieldProps = { children: ReactNode; error?: string; className?: string };

function Field({ children, error, className }: FieldProps) {
  const id = useId();
  return (
    <FieldContext.Provider value={{ id, errorId: `${id}-error`, error }}>
      <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>
    </FieldContext.Provider>
  );
}

function Label({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { id } = useField();
  return (
    <label htmlFor={id} className={cn("text-sm font-medium", className)}>
      {children}
    </label>
  );
}

type ControlProps = Omit<React.ComponentProps<"input">, "id"> & {
  as?: "input" | "textarea";
};

function Control({ as = "input", className, ...props }: ControlProps) {
  const { id, errorId, error } = useField();
  const shared = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: cn(
      "w-full rounded-md border border-border bg-surface px-3 py-2 text-base",
      "placeholder:text-muted focus-visible:outline-2 focus-visible:outline-ring",
      error && "border-red-600",
      className,
    ),
  };
  if (as === "textarea") {
    return (
      <textarea
        rows={5}
        {...shared}
        {...(props as React.ComponentProps<"textarea">)}
      />
    );
  }
  return <input {...shared} {...props} />;
}

function FieldError() {
  const { errorId, error } = useField();
  if (!error) return null;
  return (
    <p id={errorId} role="alert" className="text-sm text-red-600">
      {error}
    </p>
  );
}

function Status({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "error";
}) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "text-sm",
        tone === "success" && "text-green-700 dark:text-green-400",
        tone === "error" && "text-red-600",
        tone === "neutral" && "text-muted",
      )}
    >
      {children}
    </p>
  );
}

function Submit({
  children,
  pending,
  className,
}: {
  children: ReactNode;
  pending?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground",
        "transition-opacity disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export const Form = {
  Field,
  Label,
  Control,
  Error: FieldError,
  Status,
  Submit,
};
