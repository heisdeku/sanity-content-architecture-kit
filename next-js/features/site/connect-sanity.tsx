/** Empty state rendered when the CMS is unreachable or has no content yet. */
export function ConnectSanity({
  reason,
}: {
  reason?: "unreachable" | "empty";
}) {
  return (
    <main className="container-prose section-y">
      <p className="eyebrow">Content Architecture Kit</p>
      <h1 className="mt-3 text-3xl font-semibold">
        Connect Sanity to see content here
      </h1>
      <p className="mt-4 text-muted-foreground">
        {reason === "empty"
          ? "The project is reachable but has no published homepage yet. Open the Studio, fill in the Homepage document and publish."
          : "The site could not read from Sanity. Copy .env.example to .env, run npm run sanity:project-setup, and restart the dev server."}
      </p>
      <ol className="mt-8 list-decimal space-y-2 pl-5 font-mono text-sm text-muted-foreground">
        <li>npm run sanity:project-setup</li>
        <li>npm run dev</li>
        <li>Open /studio and publish the homepage</li>
      </ol>
    </main>
  );
}
