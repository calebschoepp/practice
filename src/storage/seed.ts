export function shouldSeed(
  currentSeedVersion: number | undefined,
  nextSeedVersion: number
): boolean {
  return currentSeedVersion === undefined || currentSeedVersion < nextSeedVersion;
}

export function upsertById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const merged = new Map<string, T>();
  for (const item of existing) {
    merged.set(item.id, item);
  }
  for (const item of incoming) {
    merged.set(item.id, item);
  }
  return [...merged.values()];
}
