/** Shown at the top of every page while draft mode is on. */
export function DraftModeBanner() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-300 px-4 py-2 font-mono text-xs text-black">
      <span>Draft mode: you are seeing unpublished content.</span>
      <a
        href="/api/draft-mode/disable"
        className="underline underline-offset-2"
      >
        Exit draft mode
      </a>
    </div>
  );
}
