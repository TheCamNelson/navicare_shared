import { getStore as getMemStore, InMemoryStore, resetStore as resetMem } from "./memory-store.js";
import { attachFilePersistence } from "./file-persistence.js";
/**
 * Returns the singleton DataStore. When NAVICARE_STORE_PATH is set OR by
 * default in Node.js, the store is backed by a JSON file at /tmp/navicare-store.json
 * so multiple Next.js processes (web + crm) can share state.
 */
export function getStore() {
    const store = getMemStore();
    // Attach file persistence once per process
    if (!globalThis.__navicareFileBacked && typeof process !== "undefined") {
        attachFilePersistence(store);
        globalThis.__navicareFileBacked = true;
    }
    // Always reload from disk before returning so we see updates from other processes
    const reload = store.reloadFromDisk;
    if (reload)
        reload();
    return store;
}
export function resetStore() {
    resetMem();
    globalThis.__navicareFileBacked = false;
}
export { InMemoryStore };
export { seedPatients, seedDeterministicPatients } from "./seed.js";
//# sourceMappingURL=index.js.map