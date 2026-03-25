import { CURRENT_SEED_VERSION, EXERCISES, VARIATIONS } from "@/catalog/catalog";
import { IndexedDbStorageAdapter } from "@/storage/indexeddb";

export const storageAdapter = new IndexedDbStorageAdapter();

let bootPromise: Promise<void> | null = null;

export function ensureStorageBootstrapped(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      await storageAdapter.initialize();
      await storageAdapter.seedIfNeeded({
        version: CURRENT_SEED_VERSION,
        exercises: EXERCISES,
        variations: VARIATIONS,
      });
    })();
  }
  return bootPromise;
}
