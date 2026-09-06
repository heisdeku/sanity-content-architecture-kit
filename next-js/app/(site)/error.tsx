"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-prose section-y">
      <p className="eyebrow">Error</p>
      <h1 className="mt-3 text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">
        The page could not be rendered. Try again, or come back in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
      >
        Try again
      </button>
    </main>
  );
}
