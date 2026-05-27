import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { InMemoryStore } from "./memory-store.js";

interface Snapshot {
  patients: [string, unknown][];
  encounters: [string, unknown][];
  intakes: [string, unknown][];
  triageResults: [string, unknown][];
  queue: [string, unknown][];
  reviews: [string, unknown][];
  messages: [string, unknown[]][];
  clinicians: [string, unknown][];
}

const DATE_KEYS = new Set([
  "created_at",
  "updated_at",
  "completed_at",
  "abandoned_at",
  "date_of_birth",
  "entered_queue_at",
  "assigned_at",
  "reviewed_at",
  "follow_up_at",
]);

function reviveDates(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(reviveDates);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (DATE_KEYS.has(k) && typeof v === "string") {
        out[k] = new Date(v);
      } else {
        out[k] = reviveDates(v);
      }
    }
    return out;
  }
  return value;
}

function defaultPath(): string {
  const env = process.env.NAVICARE_STORE_PATH;
  if (env) return env;
  return path.join(os.tmpdir(), "navicare-store.json");
}

export function attachFilePersistence(
  store: InMemoryStore,
  filePath: string = defaultPath(),
): void {
  // Load existing snapshot if present
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const snap = JSON.parse(raw) as Snapshot;
      const m = store as unknown as {
        patients: Map<string, unknown>;
        encounters: Map<string, unknown>;
        intakes: Map<string, unknown>;
        triageResults: Map<string, unknown>;
        queue: Map<string, unknown>;
        reviews: Map<string, unknown>;
        messages: Map<string, unknown[]>;
        clinicians: Map<string, unknown>;
      };
      const load = (
        target: Map<string, unknown>,
        entries: [string, unknown][] | undefined,
      ) => {
        if (!entries) return;
        target.clear();
        for (const [k, v] of entries) target.set(k, reviveDates(v));
      };
      load(m.patients, snap.patients);
      load(m.encounters, snap.encounters);
      load(m.intakes, snap.intakes);
      load(m.triageResults, snap.triageResults);
      load(m.queue, snap.queue);
      load(m.reviews, snap.reviews);
      load(m.clinicians, snap.clinicians);
      if (snap.messages) {
        m.messages.clear();
        for (const [k, v] of snap.messages) {
          m.messages.set(k, (v as unknown[]).map(reviveDates) as unknown[]);
        }
      }
    }
  } catch (err) {
    // Corrupt file? Start fresh.
    console.warn(`[navicare-store] failed to load ${filePath}:`, err);
  }

  // Save snapshot helper
  const save = (): void => {
    try {
      const m = store as unknown as {
        patients: Map<string, unknown>;
        encounters: Map<string, unknown>;
        intakes: Map<string, unknown>;
        triageResults: Map<string, unknown>;
        queue: Map<string, unknown>;
        reviews: Map<string, unknown>;
        messages: Map<string, unknown[]>;
        clinicians: Map<string, unknown>;
      };
      const snap: Snapshot = {
        patients: Array.from(m.patients.entries()),
        encounters: Array.from(m.encounters.entries()),
        intakes: Array.from(m.intakes.entries()),
        triageResults: Array.from(m.triageResults.entries()),
        queue: Array.from(m.queue.entries()),
        reviews: Array.from(m.reviews.entries()),
        messages: Array.from(m.messages.entries()),
        clinicians: Array.from(m.clinicians.entries()),
      };
      const tmp = `${filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(snap, null, 2));
      fs.renameSync(tmp, filePath);
    } catch (err) {
      console.warn(`[navicare-store] failed to persist ${filePath}:`, err);
    }
  };

  // Hook into store subscribers — persist on every event
  for (const table of [
    "patient",
    "encounter",
    "intake",
    "triage",
    "queue",
    "review",
    "message",
  ] as const) {
    store.subscribe(table, () => save());
  }

  // Persist immediately to lock in the seeded clinicians
  save();

  // Lightweight cross-process reload: re-read file before each operation.
  // We do this by wrapping the maps' get operations via a Proxy on the store.
  // Simpler: expose a manual `reloadFromDisk()` and call it from getStore() each time.
  // For simplicity in MVP, we re-load on every getStore() call (see below).
  (store as unknown as { reloadFromDisk?: () => void }).reloadFromDisk = () => {
    try {
      if (!fs.existsSync(filePath)) return;
      const raw = fs.readFileSync(filePath, "utf8");
      const snap = JSON.parse(raw) as Snapshot;
      const m = store as unknown as {
        patients: Map<string, unknown>;
        encounters: Map<string, unknown>;
        intakes: Map<string, unknown>;
        triageResults: Map<string, unknown>;
        queue: Map<string, unknown>;
        reviews: Map<string, unknown>;
        messages: Map<string, unknown[]>;
        clinicians: Map<string, unknown>;
      };
      const load = (
        target: Map<string, unknown>,
        entries: [string, unknown][] | undefined,
      ) => {
        if (!entries) return;
        target.clear();
        for (const [k, v] of entries) target.set(k, reviveDates(v));
      };
      load(m.patients, snap.patients);
      load(m.encounters, snap.encounters);
      load(m.intakes, snap.intakes);
      load(m.triageResults, snap.triageResults);
      load(m.queue, snap.queue);
      load(m.reviews, snap.reviews);
      load(m.clinicians, snap.clinicians);
      if (snap.messages) {
        m.messages.clear();
        for (const [k, v] of snap.messages) {
          m.messages.set(k, (v as unknown[]).map(reviveDates) as unknown[]);
        }
      }
    } catch {
      // ignore
    }
  };
}
