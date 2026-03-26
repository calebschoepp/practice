import { calculateSummary } from "@/domain/stats";
import type {
  Completion,
  Exercise,
  ExerciseProgressPoint,
  Instrument,
  Session,
  Variation,
} from "@/domain/types";
import type {
  CatalogSeedInput,
  CompletionInput,
  SessionInput,
  StorageAdapter,
} from "@/storage/storage-adapter";
import { shouldSeed } from "@/storage/seed";

const DB_NAME = "practice-tracker-db";
const DB_VERSION = 1;

const STORES = {
  meta: "meta",
  exercises: "exercises",
  variations: "variations",
  sessions: "sessions",
  completions: "completions",
} as const;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORES.exercises)) {
        db.createObjectStore(STORES.exercises, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.variations)) {
        db.createObjectStore(STORES.variations, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.sessions)) {
        db.createObjectStore(STORES.sessions, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.completions)) {
        const completionsStore = db.createObjectStore(STORES.completions, { keyPath: "id" });
        completionsStore.createIndex("sessionId", "sessionId", { unique: false });
        completionsStore.createIndex("exerciseId", "exerciseId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

export class IndexedDbStorageAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;

  async initialize(): Promise<void> {
    await this.getDb();
  }

  async seedIfNeeded(seed: CatalogSeedInput): Promise<void> {
    const db = await this.getDb();
    const currentSeed = await this.getMetaNumber(db, "seedVersion");
    if (!shouldSeed(currentSeed, seed.version)) {
      return;
    }

    const tx = db.transaction([STORES.exercises, STORES.variations, STORES.meta], "readwrite");
    const exerciseStore = tx.objectStore(STORES.exercises);
    const variationStore = tx.objectStore(STORES.variations);
    const metaStore = tx.objectStore(STORES.meta);

    exerciseStore.clear();
    for (const exercise of seed.exercises) {
      exerciseStore.put(exercise);
    }
    for (const variation of seed.variations) {
      variationStore.put(variation);
    }

    metaStore.put({ key: "seedVersion", value: seed.version });
    await transactionDone(tx);
  }

  async listExercises(instrument?: Instrument): Promise<Exercise[]> {
    const rows = await this.listAllFromStore<Exercise>(STORES.exercises);
    if (!instrument) return rows;
    return rows.filter((exercise) => exercise.instrument === instrument);
  }

  async listVariations(): Promise<Variation[]> {
    return this.listAllFromStore<Variation>(STORES.variations);
  }

  async getDisabledExerciseIds(): Promise<Set<string>> {
    const db = await this.getDb();
    const tx = db.transaction(STORES.meta, "readonly");
    const row = (await requestToPromise(tx.objectStore(STORES.meta).get("disabledExerciseIds"))) as
      | { key: string; value: string[] }
      | undefined;
    await transactionDone(tx);
    return new Set(row?.value ?? []);
  }

  async setExerciseEnabled(exerciseId: string, enabled: boolean): Promise<void> {
    const db = await this.getDb();
    const disabled = await this.getDisabledExerciseIds();
    if (enabled) {
      disabled.delete(exerciseId);
    } else {
      disabled.add(exerciseId);
    }
    const tx = db.transaction(STORES.meta, "readwrite");
    tx.objectStore(STORES.meta).put({ key: "disabledExerciseIds", value: [...disabled] });
    await transactionDone(tx);
  }

  async createSession(input: SessionInput): Promise<Session> {
    const db = await this.getDb();
    const session: Session = {
      id: crypto.randomUUID(),
      instrument: input.instrument,
      length: input.length,
      startedAt: input.startedAt,
    };

    const tx = db.transaction(STORES.sessions, "readwrite");
    tx.objectStore(STORES.sessions).put(session);
    await transactionDone(tx);
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    const db = await this.getDb();
    const tx = db.transaction(STORES.sessions, "readonly");
    const row = await requestToPromise(tx.objectStore(STORES.sessions).get(id));
    await transactionDone(tx);
    return (row as Session | undefined) ?? null;
  }

  async listSessions(): Promise<Session[]> {
    return this.listAllFromStore<Session>(STORES.sessions);
  }

  async endSession(id: string, endedAt: string): Promise<void> {
    const db = await this.getDb();
    const tx = db.transaction(STORES.sessions, "readwrite");
    const store = tx.objectStore(STORES.sessions);
    const row = (await requestToPromise(store.get(id))) as Session | undefined;
    if (row) {
      store.put({ ...row, endedAt });
    }
    await transactionDone(tx);
  }

  async createCompletion(input: CompletionInput): Promise<Completion> {
    const db = await this.getDb();
    const completion: Completion = {
      id: crypto.randomUUID(),
      sessionId: input.sessionId,
      exerciseId: input.exerciseId,
      variationId: input.variationId,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      tempo: input.tempo,
      difficulty: input.difficulty,
    };
    const tx = db.transaction(STORES.completions, "readwrite");
    tx.objectStore(STORES.completions).put(completion);
    await transactionDone(tx);
    return completion;
  }

  async listCompletionsBySession(sessionId: string): Promise<Completion[]> {
    const db = await this.getDb();
    const tx = db.transaction(STORES.completions, "readonly");
    const index = tx.objectStore(STORES.completions).index("sessionId");
    const rows = (await requestToPromise(index.getAll(sessionId))) as Completion[];
    await transactionDone(tx);
    return rows;
  }

  async listCompletionsByExercise(exerciseId: string): Promise<Completion[]> {
    const db = await this.getDb();
    const tx = db.transaction(STORES.completions, "readonly");
    const index = tx.objectStore(STORES.completions).index("exerciseId");
    const rows = (await requestToPromise(index.getAll(exerciseId))) as Completion[];
    await transactionDone(tx);
    return rows;
  }

  async listExerciseProgress(exerciseId: string): Promise<ExerciseProgressPoint[]> {
    const completions = await this.listCompletionsByExercise(exerciseId);
    return completions
      .sort((a, b) => a.endedAt.localeCompare(b.endedAt))
      .map((completion) => ({
        completionId: completion.id,
        exerciseId: completion.exerciseId,
        endedAt: completion.endedAt,
        tempo: completion.tempo,
        difficulty: completion.difficulty,
      }));
  }

  async getStatsSummary() {
    const [sessions, completions] = await Promise.all([
      this.listAllFromStore<Session>(STORES.sessions),
      this.listAllFromStore<Completion>(STORES.completions),
    ]);
    return calculateSummary(sessions, completions);
  }

  private async getMetaNumber(db: IDBDatabase, key: string): Promise<number | undefined> {
    const tx = db.transaction(STORES.meta, "readonly");
    const value = (await requestToPromise(tx.objectStore(STORES.meta).get(key))) as
      | { key: string; value: number }
      | undefined;
    await transactionDone(tx);
    return value?.value;
  }

  private async listAllFromStore<T>(storeName: string): Promise<T[]> {
    const db = await this.getDb();
    const tx = db.transaction(storeName, "readonly");
    const rows = (await requestToPromise(tx.objectStore(storeName).getAll())) as T[];
    await transactionDone(tx);
    return rows;
  }

  private getDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDatabase();
    }
    return this.dbPromise;
  }
}
