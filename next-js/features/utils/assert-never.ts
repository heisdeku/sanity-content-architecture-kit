/** Exhaustiveness guard for switch statements over closed unions. */
export function assertNever(value: never, label = "value"): never {
  throw new Error(`Unhandled ${label}: ${JSON.stringify(value)}`);
}
