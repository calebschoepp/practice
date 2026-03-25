# Domain Model

## Exercise

- id SERIAL PRIMARY KEY
- name TEXT
- description TEXT
- fingering TEXT e.g [C4](1) [D4](2) [E4](3)
- target_tempo INT
- time_signature TEXT
- type ENUM e.g. "triad", "scale"
- instrument ENUM e.g. "piano", "guitar"

## Variation

- id SERIAL PRIMARY KEY
- for_type ENUM e.g. "triad", "scale"
- name TEXT e.g. "staccato", "long-short"
- description TEXT
- instructions TEXT

## Completion

- id SERIAL PRIMARY KEY
- start TIMESTAMP NOT NULL
- end TIMESTAMP
- actual_tempo INT
- difficulty INT e.g. 0-4
- exercise_id INT REFERENCES Exercise(id)
- session_id INT REFERENCES Session(id)

## Session

- id SERIAL PRIMARY KEY
- start TIMESTAMP NOT NULL
- end TIMESTAMP
- notes TEXT

# User Interface Screens

## Home

- A stylistic title across the top "Practice Better"
- In the middle of screen there is a button for stats and a button for settings.
- Near the bottom a CTA button that has a different text every time e.g. "Start Practicing", "Let's Go", "Time to Practice", "Get Practicing", "Start Your Session", "Begin Practicing", "Let's Get Started", "Time to get to work", "Start Your Journey", "Let's Do This", "Get Started Now", "Your Practice Awaits", "Start Practicing Now", "Let's Get Practicing", "Time to Start Practicing", "Begin Your Practice", "Get Practicing Now", "Start Your Practice Journey", "Let's Get Started Practicing", "Time to Start Your Practice"
  - Above it there is a flip flop toggle where one of two things is selected for the kind of thing you want to practice. A guitar or piano emoji.
  - Above the button and beside the toggle there is also another selection for how long to practice. Either short, long, or unlimited.

## Stats

- Page consists of a number of cards.
  - First card recounts total number of sessions, total time spent practicing, and average time per session.
  - Second card recounts daily and weekly streaks.
  - Third card lets you select an exercise and see a graph of your progress on that exercise over time. X axis is date, Y axis is tempo. Each point is a session where you practiced that exercise and the point's Y value is the tempo you practiced it at. It also shows difficulty as color of the point e.g. green is easy, yellow is medium, red is hard.
- Use shadcn charts for the graphs.

## Settings

- Just some text about how this is a fun bonus easter egg screen for now.

## Practice Session

- At the top is the name of the current exercise of the session. Below this if necessary is a variation name e.g. "staccato" or "long-short" in a badge along with a badge of the type of exercise.
- Below the name is a keyboard or fretboard graphic with the fingering as necessary.
- Below the fingering is the BPM tempo and a plus and minus button beside it that lets you slow it down or speed it up in increments.
- At the bottom of the screen is a CTA button that says "done". Clicking this ends the exercise and pops up a card that covers the screen and blurs the background where you can input how you did from couldn't do it to perfect which maps to difficulty. Then it takes you to the next exercise in the session or if there are no more exercises it ends the session and takes you back to the home screen. When an exercise is finished a completion is created where the actual tempo is recorded along with the difficulty and the end time. When the session is finished the end time of the session is also recorded.
- In the very top right there is a red x button that ends the session immediately and takes you back to the home screen.
- To the left of the x button is a mute button which would mute the metronome
- In very small text in the bottom right it says "n/3" where n is the current exercise number and 3 is the total number of exercises in the session. Total would be 3 for short, 5 for long, and "?" for unlimited.

# Design notes:

- Make storage pluggable through an interface such that I could back it with next.js api eventually if I wanted to

# Open questions

# Decisions made

## IDs and keys

- Use UUID primary keys for mutable runtime data instead of ints.
  - `Session.id`: UUID
  - `Completion.id`: UUID
- Use human-stable IDs for static catalog data (domain content authored in files).
  - `Exercise.id`: string like `piano-c-major-scale`
  - `Variation.id`: string like `staccato`
- Why this split:
  - UUIDs are great for client-generated runtime records (no collisions, easy offline creation).
  - Human-stable IDs make static JSON content easy to edit, diff, and reference over time.

## Static data strategy: JSON directly vs seeding into IndexedDB

### Option A: Consume static JSON directly (no seeding)

- How it works:
  - Keep `Exercise` and `Variation` in versioned JSON files in the repo.
  - App reads those files directly at runtime.
  - IndexedDB stores only runtime/user data (`Session`, `Completion`, preferences, etc.).
- Pros:
  - Simplest mental model and implementation.
  - No migration/version bookkeeping for static content.
  - Editing content is immediate: update JSON and deploy.
  - No duplicate copy of static data in DB.
- Cons:
  - Limited/no local mutation of static content without adding another write path.
  - Joining historical runtime data with changed static content can be trickier if IDs or semantics change.

### Option B: Seed static JSON into IndexedDB

- How it works:
  - JSON remains the source of truth in code.
  - On app startup, upsert JSON into IndexedDB using a seed version.
  - App then reads static content from IndexedDB.
- Pros:
  - Single query surface for runtime and static data.
  - Easier to support future user customization/overrides/offline edits.
  - Can snapshot static content state at time of completion if needed.
- Cons:
  - More complexity (seed lifecycle + versioning + migrations).
  - Risk of stale seeded content if versioning is mishandled.
  - Duplicates source data at runtime.

### Recommendation right now

- We will use Option B (seed static JSON into IndexedDB).
- JSON files remain the authoring source of truth, and app startup performs versioned upsert seeding.
- Keep storage adapter boundaries clean so this can still evolve to a remote API-backed implementation later.

### Decision for this project

- Adopt seeded static catalog data in IndexedDB.
- Add a `seedVersion` strategy to prevent stale catalog content.
- Read `Exercise` and `Variation` via storage layer after seeding.

# Storage adapter shape (draft)

Use a pluggable `StorageAdapter` with use-case-oriented methods so UI/business logic is backend-agnostic.

```ts
export type Instrument = "piano" | "guitar";
export type PracticeLength = "short" | "long" | "unlimited";
export type Difficulty = 0 | 1 | 2 | 3 | 4;

export interface Exercise {
  id: string; // human-stable id
  name: string;
  description?: string;
  fingering?: string;
  targetTempo?: number;
  timeSignature?: string;
  type: "triad" | "scale" | string;
  instrument: Instrument;
}

export interface Variation {
  id: string; // human-stable id
  forType: Exercise["type"];
  name: string;
  description?: string;
  instructions?: string;
}

export interface Session {
  id: string; // UUID
  start: string; // ISO timestamp
  end?: string;
  notes?: string;
  instrument: Instrument;
  length: PracticeLength;
}

export interface Completion {
  id: string; // UUID
  sessionId: string; // UUID
  exerciseId: string; // Exercise.id
  variationId?: string; // Variation.id
  start: string; // ISO timestamp
  end?: string;
  actualTempo?: number;
  difficulty: Difficulty;
}

export interface StorageAdapter {
  // static catalog
  seedIfNeeded(seedVersion: number): Promise<void>;
  listExercises(instrument?: Instrument): Promise<Exercise[]>;
  listVariations(forType?: string): Promise<Variation[]>;

  // sessions
  createSession(input: Omit<Session, "id">): Promise<Session>;
  endSession(sessionId: string, end: string): Promise<void>;
  getSession(sessionId: string): Promise<Session | null>;
  listSessions(): Promise<Session[]>;

  // completions
  createCompletion(input: Omit<Completion, "id">): Promise<Completion>;
  listCompletionsBySession(sessionId: string): Promise<Completion[]>;
  listCompletionsByExercise(exerciseId: string): Promise<Completion[]>;
}
```

Notes:

- For this project, static catalog reads are folded into `StorageAdapter`.
- Startup flow should run `seedIfNeeded(CURRENT_SEED_VERSION)` before first catalog query.
