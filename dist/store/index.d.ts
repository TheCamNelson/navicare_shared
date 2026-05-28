import { InMemoryStore } from "./memory-store.js";
import type { DataStore } from "./types.js";
declare global {
    var __navicareFileBacked: boolean | undefined;
}
/**
 * Returns the singleton DataStore. When NAVICARE_STORE_PATH is set OR by
 * default in Node.js, the store is backed by a JSON file at /tmp/navicare-store.json
 * so multiple Next.js processes (web + crm) can share state.
 */
export declare function getStore(): DataStore;
export declare function resetStore(): void;
export { InMemoryStore };
export type { DataStore, PatientCreateInput, EncounterCreateInput, QueueListFilter, StoreEventCallback, StoreTable, } from "./types.js";
export { seedPatients, seedDeterministicPatients } from "./seed.js";
//# sourceMappingURL=index.d.ts.map