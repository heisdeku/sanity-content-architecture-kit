const formatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** Human date from an ISO string. Returns an empty string for invalid input. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : formatter.format(date);
}
