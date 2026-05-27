import { getStore as getMemStore, InMemoryStore, resetStore as resetMem } from "./memory-store.js";
import { attachFilePersistence } from "./file-persistence.js";
import type { DataStore } from "./types.js";

declare global {
  // eslint-disable-next-line no-var
  var __navicareFileBacked: boolean | undefined;
}

/**
 * Returns the singleton DataStore. When NAVICARE_STORE_PATH is set OR by
 * default in Node.js, the store is backed by a JSON file at /tmp/navicare-store.json
 * so multiple Next.js processes (web + crm) can share state.
 */
export function getStore(): DataStore {
  const store = getMemStore() as DataStore;
  // Attach file persistence once per process
  if (!globalThis.__navicareFileBacked && typeof process !== "undefined") {
    attachFilePersistence(store as unknown as InMemoryStore);
    globalThis.__navicareFileBacked = true;
  }
  // Always reload from disk before returning so we see updates from other processes
  const reload = (store as unknown as { reloadFromDisk?: () => void }).reloadFromDisk;
  if (reload) reload();
  return store;
}

export function resetStore(): void {
  resetMem();
  globalThis.__navicareFileBacked = false;
}

export { InMemoryStore };
export type {
  DataStore,
  PatientCreateInput,
  EncounterCreateInput,
  QueueListFilter,
  StoreEventCallback,
  StoreTable,
} from "./types.js";
export { seedPatients, seedDeterministicPatients } from "./seed.js";
